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

// Return a JSON object in the format expected by tokenPermissions().
const toJSON = permission => ({
  id: permission.id,
  name: permission.resource.name,
  actions: permission.actions
})

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
      addActions: function (actions) {
        return this.set('actions', addActions(this.actions, actions))
      },
      removeActions: function (actions) {
        return this.set('actions', removeActions(this.actions, actions))
      },
      toJSON: function () {
        return toJSON(this.get())
      }
    }
  })

  return Permission
}

module.exports = PermissionSchema
