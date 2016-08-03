'use strict'

const argon2 = require('argon2')
const validator = require('validator')
const base64url = require('base64-url')

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
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    loginAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate
      }
    }
  },
  {
    classMethods: {
      associate: function (models) {
        User.hasMany(models.Permission, { foreignKey: 'userId' })
      },
      filterAdminProps
    },
    instanceMethods: {
      verifyPassword,
      findPermission,
      removePermission,
      addPermission,
      tokenPayload,
      toJSON
    },
    scopes: {
    },
    hooks: {
      beforeSave: function (user, next) {
        Promise.all([
          sanitizeUser(user),
          hashPasswordHook(user)
        ])
          .then(next)
          .catch(next)
      }
    }
  })

  return User
}

// Sanitize all new inputs before saving to database, except for password, which
// is handled separately using hash function.
const sanitizeUser = user => new Promise((resolve, reject) => {
  if (user.isModified('username'))
    user.username = validator.trim(user.username)
    user.username = base64url.escape(user.username)

  if (this.isModified('email'))
    user.email = validator.trim(user.email)
    user.email = validator.normalizeEmail(user.email, {
      lowercase: true,
      remove_dots: false,
      remove_extension: true
    })
    user.email = validator.escape(user.email)

  if (user.isModified('isActive'))
    user.isActive = validator.toBoolean(user.isActive, true)

  if (user.isModified('isAdmin'))
    user.isAdmin = validator.toBoolean(user.isAdmin, true)

  if (user.isModified('profile.name'))
    user.profile.name = validator.trim(user.profile.name)
    user.profile.name = validator.escape(user.profile.name)

  if (user.isModified('profile.location'))
    user.profile.location = validator.trim(user.profile.location)
    user.profile.location = validator.escape(user.profile.location)

  if (user.isModified('website'))
    user.profile.website = validator.trim(user.profile.website)
    user.profile.website = base64url.escape(user.profile.website)

  if (user.isModified('profile.company'))
    user.profile.company = validator.trim(user.profile.company)
    user.profile.company = validator.escape(user.profile.company)

  resolve(user)
})

// Convert password as argon2 hash before saving it.
const hashPassword = password => argon2.generateSalt(SALT_LENGTH)
  .then(salt => argon2.hash(password, salt, ARGON2_OPTIONS))

const isUrlSafe = value => {
  if (validator.validator.matches(value, /^[A-Za-z0-9\-_]+$/))
    throw new Error('Must be URL safe (use hyphens instead of spaces, like "my-cool-username")')
}

// Only admins can activate or de-activate users and set the admin status.
const filterAdminProps = (isAdmin, updates) => {
  const filteredUpdates = Object.assign({}, updates)

  if (updates.hasOwnProperty('isActive') && !isAdmin)
    delete filteredUpdates.isActive

  if (updates.hasOwnProperty('isAdmin') && !isAdmin)
    delete filteredUpdates.isAdmin

  return filteredUpdates
}

const verifyPassword = function (password) {
  return argon2.verify(this.password, password)
}

const hashPasswordHook = user => new Promise((resolve, reject) => {
  if (!user.changed('password')) return resolve()

  // If the password has changed, hash it before saving, otherwise just go next.
  hashPassword(user.password)
    .then(hash => {
      user.set('password', hash)
      resolve()
    })
    .catch(reject)
})

// Return an array of actions for the permission which matches the given
// resource name.
const findPermission = function (name) {
  return this.permissions.find(perm => (perm.name === name))
}

// Cut the resource matching `name` from the permissions array.
const removePermission = function (name) {
  const index = this.permissions.findIndex(permission => permission.name === name)
  if (index >= 0) this.permissions.splice(index, 1)
}

// Replace the permissions for `resource` with `actions`, or add them if they
// don't already exist.
const addPermission = function ({ resource = {}, actions = [] }) {
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
const tokenPermissions = modelPermissions =>
  modelPermissions.reduce((acc, perm) => {
    return Object.assign(acc, {
      [perm.name]: {
        actions: perm.actions
      }
    })
  }, {})

// Generate limited data object for use in JWT token payload.
const tokenPayload = function () {
  return {
    userId: this.id,
    username: this.username,
    email: this.email,
    isActive: this.isActive,
    isAdmin: this.isAdmin,
    permissions: tokenPermissions(this.permissions)
  }
}

// More data returned in JSON form than in token payload.
const toJSON = function () {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    isActive: this.isActive,
    isSuperAdmin: this.isSuperAdmin,
    permissions: tokenPermissions(this.permissions),
    profile: this.profile,
    loginAt: this.loginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

module.exports = UserSchema
