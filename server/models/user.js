'use strict'

const argon2 = require('argon2')
const validator = require('validator')
const base64url = require('base64-url')
const { isUrlSafe } = require('../helpers/validation_helper')
const Sequelize = require('sequelize')

const SALT_LENGTH = 32

const ARGON2_OPTIONS = {
  timeCost: 3,
  memoryCost: 12, // 2^12kb
  parallelism: 1, // threads
  argon2d: false // use agron2i
}

// Return argon2 hash from password string.
const hashPassword = password => argon2.hash(password, ARGON2_OPTIONS)
const verifyPassword = (p1, p2) => argon2.verify(p1, p2)

// Only admins can activate or de-activate users and set the admin status.
// Also, ignore password field if it is blank (keep existing in that case).
// Also, don't allow `permission` directly on the user model itself (these are
// handled in their own separate model).
const filterProps = (isAdmin, props) => {
  const filteredProps = Object.assign({}, props)

  if (props.hasOwnProperty('id'))
    delete filteredProps.id

  if (props.hasOwnProperty('isActive') && !isAdmin)
    delete filteredProps.isActive

  if (props.hasOwnProperty('isAdmin') && !isAdmin)
    delete filteredProps.isAdmin

  if (props.hasOwnProperty('password') && !props.password)
    delete filteredProps.password

  if (props.hasOwnProperty('permissions'))
    delete filteredProps.permissions

  return filteredProps
}

// If the user already has existing permission for this resource, update
// the existing permission with the new actions (the valid ones).
// ...otherwise, create a new permission.
const updatePermission = (user, resource, actions) => {
  const { Permission } = user.sequelize.models
  const validActions = resource.validActions(actions)

  return Permission.findOne({
    where: Sequelize.and(
      { userId: user.id },
      { resourceId: resource.id }
    )
  })
    .then(permission => {
      if (!permission) {
        return Permission.create({
          userId: user.id,
          resourceId: resource.id,
          actions: validActions
        })
      }

      return permission.update({
        actions: validActions
      })
    })
}

// Update all `permissions` for user (either by modifying existing permissions
// or creating new ones). Cycle through each resource in `permissions` and
// update the permission for that resource for `user`. Finally, if successful,
// return a newly loaded version of the user which should include the newly
// created/modified permissions associations.
const updatePermissions = (user, permissions) => {
  const { Permission, Resource, User } = user.sequelize.models

  if (!permissions || permissions.length === 0) return user

  return Resource.findAll()
    .then(resources => resources.reduce((updatedPermissions, resource) => {
      if (permissions &&
          permissions[resource.name] &&
          permissions[resource.name].actions &&
          Array.isArray(permissions[resource.name].actions)) {
        return [
          ...updatedPermissions,
          updatePermission(user, resource, permissions[resource.name].actions)
        ]
      }

      return updatedPermissions
    }, []))
    .then(updatePermissionPromises => Promise.all(updatePermissionPromises))
    .then(permissions => User.findById(user.id, {
      include: [{
        model: Permission,
        include: [Resource]
      }]
    }))
}

// Find the matching permission and destroy it.
const deletePermission = (user, resourceName) => {
  const { Permission } = user.sequelize.models
  const userPermissions = user.toJSON().permissions

  return Permission.findById(userPermissions[resourceName].id)
    .then(permission => {
      if (!permission) throw `User '${ user.id }' has no matching permission for resource '${ resourceName }'`

      return permission.destroy()
    })
}


// TODO: Maybe include this as part of cred rather than defining it here.
// Format an array of permissions for use in a JWT access token, returning an
// object whose keys are the names of a resource which references an array of
// permissible actions. Optionally include an `id` attribute along with
// `actions` (used mostly for regular user.toJSON construction).
//
// Input (from a user's array of permissions from Permission.toJSON()):
// [
//   {
//     name: "my-amazing-resource",
//     actions: ["read:active"]
//   },
//   {
//     name: "some-other-resource",
//     actions: ["admin", "read:active", "write:new"]
//   }
// ]
//
// Output:
// {
//    "my-amazing-resource": {
//      actions: ["read:active"]
//    },
//    "some-other-resource": {
//      actions: ["admin", "read:active", "write:new"]
//    }
// }
const tokenPermissions = (permissions = [], includeId = false) => {
  if (!permissions) return {}

  return permissions.reduce((acc, perm) => {
    const attrs = { actions: perm.actions }

    if (includeId) Object.assign(attrs, { id: perm.id })

    return Object.assign(acc, { [perm.name]: attrs })
  }, {})
}

// Run toJSON() on each permission so the data is in the expected format for the
// custom user toJSON() function.
const userWithJSONPermissions = user => {
  if (!user.permissions || user.permissions.length <= 0) return user

  const permissions = user.permissions.map(permission => {
    return permission.toJSON()
  })

  return Object.assign({}, user, { permissions })
}

// Generate limited data object for use in JWT token payload.
const tokenPayload = user => ({
  userId: user.id,
  username: user.username,
  isActive: user.isActive,
  isAdmin: user.isAdmin,
  permissions: tokenPermissions(user.permissions)
})

// More data returned in JSON form than in token payload.
const toJSON = user => {
  const props = {
    id: user.id,
    username: user.username,
    email: user.email,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    permissions: tokenPermissions(user.permissions, true),
    friendships: user.friendships ? user.friendships : [],
    loginAt: user.loginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }

  // Add social IDs if they are being used.
  if (user.facebookId) props.facebookId = user.facebookId
  if (user.githubId) props.githubId = user.githubId
  if (user.twitterId) props.twitterId = user.twitterId
  if (user.googleId) props.googleId = user.googleId

  return props
}

// If the password has changed, hash it before saving, otherwise just continue.
const beforeSave = user => {
  if (!user.password) return

  return hashPassword(user.password)
    .then(hash => { user.password = hash })
    .catch(err => console.log('Error hashing password', err))
}

const beforeUpdate = user => {
  if (!user.changed('password')) return

  return beforeSave(user)
}

const UserSchema = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Username cannot be blank.'
        },
        isUrlSafe: isUrlSafe('Username')
      },
      set: function (val) {
        if (!val) return this.setDataValue('username', '')

        this.setDataValue('username', base64url.escape(validator.trim(val)))
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
      // validate: {
      //   notEmpty: {
      //     msg: 'Password cannot be blank.'
      //   }
      // }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Email cannot be blank.'
        },
        isEmail: {
          msg: 'Must use a valid email address.'
        }
      },
      set: function (val) {
        if (!val) return this.setDataValue('email', '')

        let email = validator.trim(val)
        email = validator.escape(email)
        email = validator.normalizeEmail(email, {
          lowercase: true,
          remove_dots: false,
          remove_extension: true
        })

        this.setDataValue('email', email)
      }
    },
    facebookId: { type: DataTypes.STRING, allowNull: true },
    githubId: { type: DataTypes.STRING, allowNull: true },
    twitterId: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING, allowNull: true },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    loginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    }
  },
  {
    name: {
      singular: 'user',
      plural: 'users'
    },
    tableName: 'Users',
    classMethods: {
      associate: models => {
        User.hasMany(models.Permission, { foreignKey: 'userId' })
        User.hasMany(models.Metadata, { foreignKey: 'userId' })
        User.hasMany(models.Friendship, {
          foreignKey: 'userId',
          onDelete: 'cascade'
        })
        User.belongsToMany(models.User, {
          as: 'friends',
          through: 'Friendship',
          foreignKey: 'userId'
        })
        User.hasMany(models.Group, { foreignKey: 'userId' })
        User.hasMany(models.Membership, { foreignKey: 'userId' })
        User.belongsToMany(models.Group, {
          as: 'memberships',
          through: 'Membership',
          foreignKey: 'userId',
        })
      },
      filterProps
    },
    instanceMethods: {
      verifyPassword: function (password) {
        return verifyPassword(this.password, password)
      },
      loginUpdate: function () {
        return this.update({ loginAt: Date.now() })
      },
      updatePermission: function (resource, actions) {
        return updatePermission(this, resource, actions)
      },
      updatePermissions: function (permissions) {
        return updatePermissions(this, permissions)
      },
      deletePermission: function (resourceName) {
        return deletePermission(this, resourceName)
      },
      tokenPayload: function () {
        return tokenPayload(userWithJSONPermissions(this.get()))
      },
      toJSON: function () {
        return toJSON(userWithJSONPermissions(this.get()))
      }
    },
    hooks: {
      beforeCreate: beforeSave,
      beforeUpdate: beforeUpdate,
      beforeValidate: function (user, options, cb) {
        // If the user has a password property, force it not to be null in order
        // to use custom error message for being "empty".
        if (user.hasOwnProperty('password')) user.password = user.password || ''

        cb(null, user)
      }
    },
    scopes: {
      active: { where: { isActive: true } },
      inactive: { where: { isActive: false } },
      admins: { where: { isAdmin: true } },
      nonAdmins: { where: { isAdmin: false } }
    }
  })

  return User
}

module.exports = UserSchema
