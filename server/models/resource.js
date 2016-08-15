'use strict'

const validator = require('validator')
const base64url = require('base64-url')
const {
  isUrlSafe,
  isArray,
  isArrayOfStrings,
  notEmptyOrInList
} = require('../helpers/validation_helper')
const { addActions, removeActions } = require('../helpers/action_helper')

const toJSON = resource => ({
  id: resource.id,
  name: resource.name,
  url: resource.url,
  actions: resource.actions,
  isActive: resource.isActive
})

const ResourceSchema = function (sequelize, DataTypes) {
  const Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUrlSafe
      },
      set: function (val) {
        this.setDataValue('name', base64url.escape(validator.trim(val)))
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: function (val) {
          return validator.isUrl(val, {
            require_tld: false,
            require_protocol: true,
            allow_underscores: true
          })
        }
      },
      set: function (val) {
        this.setDataValue('url', validator.trim(val))
      }
    },
    actions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isArray,
        isArrayOfStrings
      },
      set: function (val) {
        this.setDataValue('actions', val.map(action => {
          return validator.escape(validator.trim(action))
        }))
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  },
  {
    name: {
      singular: 'resource',
      plural: 'resources'
    },
    tableName: 'Resources',
    classMethods: {
      associate: models => {
        Resource.hasMany(models.Permission, { foreignKey: 'resourceId' })
      }
    },
    instanceMethods: {
      addActions: function (actions) {
        return this.set('actions', addActions(this.actions, actions))
      },
      removeActions: function (actions) {
        return this.set('actions', removeActions(this.actions, actions))
      },
      validActions: function (actions) {
        return actions.filter(action => this.actions.includes(action))
      },
      toJSON: function () {
        return toJSON(this.get())
      }
    },
    scopes: {
      active: { where: { isActive: true } },
      inactive: { where: { isActive: false } }
    }
  })

  return Resource
}

module.exports = ResourceSchema
