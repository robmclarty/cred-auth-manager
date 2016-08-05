'use strict'

const argon2 = require('argon2')
const validator = require('validator')
const base64url = require('base64-url')
const { isUrlSafe } = require('../helpers/validation_helper')
const { Permission } = require('./index')

const SALT_LENGTH = 32

const ARGON2_OPTIONS = {
  timeCost: 3,
  memoryCost: 12, // 2^12kb
  parallelism: 1, // threads
  argon2d: false // use agron2i
}

// Return argon2 hash from password string.
const hashPassword = password => argon2.generateSalt(SALT_LENGTH)
  .then(salt => argon2.hash(password, salt, ARGON2_OPTIONS))

const verifyPassword = p1 => p2 => argon2.verify(p1, p2)

// Only admins can activate or de-activate users and set the admin status.
const filterAdminProps = (isAdmin, updates) => {
  const filteredUpdates = Object.assign({}, updates)

  if (updates.hasOwnProperty('isActive') && !isAdmin)
    delete filteredUpdates.isActive

  if (updates.hasOwnProperty('isAdmin') && !isAdmin)
    delete filteredUpdates.isAdmin

  return filteredUpdates
}

// Return an array of actions for the permission which matches the given
// resource name.
const findPermissionIn = permissions => name =>
  permissions.find(perm => (perm.name === name))

// Cut the resource matching `name` from the permissions array.
const removePermissionFrom = permissions => name => {
  const index = permissions.findIndex(permission => permission.name === name)

  return index >= 0 ?
    [
      ...permissions.slice(0, index),
      ...permissions.slice(index + 1)
    ] :
    permissions
}

// Replace the permissions for `resource` with `actions`, or add them if they
// don't already exist.
const addPermissionTo = permissions => name => function ({ resource = {}, actions = [] }) {
  let validActions = []

  // If permissions already exist for this resource, remove the old ones and
  // replace them with the new actions.
  this.removePermission(resource.name)

  // Filter actions to only include valid actions (i.e., strings which already
  // exist in resource.actions).
  if (resource.actions) {
    validActions = actions.filter(action => resource.actions.indexOf(action) >= 0)
  }

  // Add a new permission with valid actions.
  // Accept an empty array of actions. The absence of a given action means it
  // will remove that permitted action from the user, regardless of what they
  // already had.
  this.permissions.push(new Permission({
    resourceId: resource.id,
    name: resource.name,
    actions: validActions
  }))
}

// Format permissions for use in a JWT access token, returning an object whose
// keys are the names of a resource which references an array of permissible
// actions.
// {
//    "my-amazing-resource": {
//      actions: ["read:active"]
//    },
//    "some-other-resource": {
//      actions: ["admin", "read:active", "write:new"]
//    }
// }
const tokenPermissions = permissions => permissions.reduce((acc, perm) => {
  return Object.assign(acc, {
    [perm.name]: {
      actions: perm.actions
    }
  })
}, {})

// Generate limited data object for use in JWT token payload.
const tokenPayload = user => () => ({
  userId: user.id,
  username: user.username,
  email: user.email,
  isActive: user.isActive,
  isAdmin: user.isAdmin,
  permissions: tokenPermissions(user.permissions)
})

// More data returned in JSON form than in token payload.
const toJSON = user => () => ({
  id: user.id,
  username: user.username,
  email: user.email,
  isActive: user.isActive,
  isSuperAdmin: user.isSuperAdmin,
  permissions: tokenPermissions(user.permissions),
  loginAt: user.loginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
})

const UserSchema = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDv4,
      validate: {
        notNull: true,
        notEmpty: true,
        isUrlSafe
      },
      set: function (val) {
        this.setDataValue('username', base64url.escape(validator.trim(val)))
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: true,
        notEmpty: true
      },
      set: function (val) {
        let email = validator.trim(val)
        email = validator.normalizeEmail(email, {
          lowercase: true,
          remove_dots: false,
          remove_extension: true
        })
        email = validator.escape(email)

        this.setDataValue('email', email)
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      set: function (val) {
        this.setDataValue('isActive', validator.toBoolean(val, true))
      }
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      set: function (val) {
        this.setDataValue('isAdmin', validator.toBoolean(val, true))
      }
    },
    loginAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    }
  },
  {
    tableName: 'Users',
    classMethods: {
      associate: models => {
        User.hasMany(models.Permission, { foreignKey: 'userId' })
      },
      filterAdminProps
    },
    instanceMethods: {
      // verifyPassword: verifyPassword(this.password),
      // findPermission: findPermissionIn(this.permissions),
      // removePermission: name => this.set('permissions', removePermissionFrom(this.permissions, name)),
      // addPermission: name => this.set('permissions', addPermissionTo(this.permissions, name)),
      tokenPayload: tokenPayload(this),
      toJSON: toJSON(this)
    },
    hooks: {
      // If the password has changed, hash it before saving,
      // otherwise just continue.
      beforeSave: (user, next) => {
        if (!user.changed('password')) return next()

        argon2Password(user.password)
          .then(hash => {
            user.set('password', hash)
            next()
          })
          .catch(next)
      }
    },
    defaultScope: {
      include: [{
        model: Permission,
        attributes: ['resource.name', 'actions']
      }]
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
