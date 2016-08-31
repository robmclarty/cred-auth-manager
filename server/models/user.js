'use strict'

const argon2 = require('argon2')
const validator = require('validator')
const base64url = require('base64-url')
const { isUrlSafe } = require('../helpers/validation_helper')
const { Permission, Resource } = require('./')

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

const verifyPassword = (p1, p2) => argon2.verify(p1, p2)

// Only admins can activate or de-activate users and set the admin status.
// Also, ignore password field if it is blank (keep existing in that case).
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

  return filteredProps
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
  if (!user.permissions) return user

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
const toJSON = user => ({
  id: user.id,
  username: user.username,
  email: user.email,
  isActive: user.isActive,
  isAdmin: user.isAdmin,
  permissions: tokenPermissions(user.permissions, true),
  loginAt: user.loginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
})

// If the password has changed, hash it before saving, otherwise just continue.
const beforeSave = user => {
  if (!user.changed('password')) return

  return hashPassword(user.password)
    .then(hash => {
      user.password = hash
    })
    .catch(err => console.log("Error hashing password", err))
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
      defaultValue: DataTypes.UUIDv4,
      validate: {
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
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
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
      // getActions: function (name) {
      //   return getActions(name, this.permissions)
      // }
      // removePermission: name => this.set('permissions', removePermissionFrom(this.permissions, name)),
      // addPermission: name => this.set('permissions', addPermissionTo(this.permissions, name)),
      tokenPayload: function () {
        return tokenPayload(userWithJSONPermissions(this.get()))
      },
      toJSON: function () {
        return toJSON(userWithJSONPermissions(this.get()))
      }
    },
    hooks: {
      beforeCreate: beforeSave,
      beforeUpdate: beforeSave
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
