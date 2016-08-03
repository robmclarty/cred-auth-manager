'use strict'

const validator = require('validator')
const base64url = require('base64-url')

const PermissionSchema = function (sequelize, DataTypes) {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    resourceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Resource',
        key: 'id'
      }
    },
    resourceName: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Resource',
        key: 'name'
      },
      validate: {
        notNull: true,
        notEmpty: true,
        isUrlSafe
      }
    },
    actions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: true,
      validate: {
        isArray,
        isArrayOfStrings
      }
    }
  },
  {
    classMethods: {
      associate: function (models) {
        Permission.belongsTo(models.Resource, { foreignKey: 'resourceId' })
        Permission.belongsTo(models.User, { foreignKey: 'userId' })
      }
    },
    instanceMethods: {
      toJSON: function () {
        actions: this.actions
      }
    },
    hooks: {
      beforeSave: function (permission, options) {
        const sanitizedPermission = sanitizePermission(permission)

        Object.keys(sanitizedPermission).forEach(key => {
          permission[key] = sanitizedPermission[key]
        })
      }
    }
  })

  return User
}

const sanitizePermission = ref => {
  const permission = Object.assign({}, ref)

  if (permission.isModified('name'))
    permission.name = validator.trim(permission.name)
    permission.name = base64url.escape(permission.name)

  if (permission.isModified('actions'))
    permission.actions = permission.actions.map(action => {
      validator.escape(validator.trim(action))
    })

  return permission
}

const isUrlSafe = value => {
  if (validator.validator.matches(value, /^[A-Za-z0-9\-_]+$/))
    throw new Error('Must be URL safe (use hyphens instead of spaces, like "my-cool-username")')
}

const isArray = arr => {
  if (!Array.isArray(arr))
    throw new Error('Actions must be an array.')
}

const isArrayOfStrings = arr => {
  arr.forEach(item => {
    if (typeof item !== 'string')
      throw new Error('Actions must be string values.')
  })
}

module.exports = PermissionSchema
