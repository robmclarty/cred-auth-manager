'use strict'

const validator = require('validator')
const base64url = require('base64-url')
const {
  isUrlSafe,
  isArray,
  isArrayOfStrings
} = require('../helpers/validation_helper')
const { addActions, removeActions } = require('../helpers/action_helper')
const { Resource, User } = require('./index')

const addActionsTo = permission => actions => {
  permission.setDataValue('actions', addActions(permission.actions, actions))
}

const removeActionsFrom = permission => actions => {
  permission.setDataValue('actions', removeActions(permission.actions, actions))
}

// Return a JSON object in the format expected by tokenPermissions().
const toJSON = permission => {
  console.log('permission: ', JSON.stringify(permission, null, 4))
  return ({
  name: permission.resource.name,
  actions: permission.actions
})
}

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
        model: 'Users',
        key: 'id'
      }
    },
    resourceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Resources',
        key: 'id'
      }
    },
    actions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: true,
      validate: {
        isArray,
        isArrayOfStrings
      },
      set: function (val) {
        this.setDataValue('actions', val.map(action => {
          return validator.escape(validator.trim(action))
        }))
      }
    }
  },
  {
    name: {
      singular: 'permission',
      plural: 'permissions'
    },
    tableName: 'Permissions',
    classMethods: {
      associate: models => {
        Permission.belongsTo(models.User, { foreignKey: 'userId' })
        Permission.belongsTo(models.Resource, { foreignKey: 'resourceId' })
      }
    },
    instanceMethods: {
      addActions: function () { return addActionsTo(this) },
      removeActions: function () { return removeActionsFrom(this) },
      toJSON: function () { return toJSON(this.get()) }
    }
  })

  return Permission
}

module.exports = PermissionSchema
