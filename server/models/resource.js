'use strict'

const validator = require('validator')
const base64url = require('base64-url')

const ResourceSchema = function (sequelize, DataTypes) {
  const Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: true,
        notEmpty: true,
        isUrlSafe
      }
    }
    url: {
      DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        isUrl: true
      }
    },
    actions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isArray,
        isArrayOfStrings
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  },
  {
    classMethods: {
      associate: function (models) {
        Resource.hasMany(models.Permission, { foreignKey: 'resourceId' })
      },
      updateActions,
      removeActions
    },
    hooks: {
      beforeSave: function (resource, options) {
        const sanitizedResource = sanitizeResource(resource)

        Object.keys(sanitizedResource).forEach(key => {
          resource[key] = sanitizedResource[key]
        })
      }
    }
  })

  return Resource
}

// Sanitize any new inputs before saving to database.
const sanitizeResource = resource => {
  if (resource.isModified('name'))
    resource.name = validator.trim(resource.name)
    resource.name = base64url.escape(resource.name)

  if (resource.isModified('url'))
    resource.url = validator.trim(resource.url)
    resource.url = base64url.escape(resource.url)

  if (resource.isModified('actions'))
    resource.actions = resource.actions.map(action => {
      validator.escape(validator.trim(action))
    })

  if (resource.isModified('isActive'))
    resource.isActive = validator.toBoolean(resource.isActive, true)

  return resource
}

const notEmptyOrInList = (value, list) => value !== '' && !list.includes(value)

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

// Take an existing array of resource actions and merge them with a new array
// of actions. Filter out duplicates and strip any html tags to ensure that the
// array of actions returned is a set of safe, unique, strings.
const updateActions = ({ oldActions = [], newActions = [] }) => {
  // Escape any tags in any of the actions and then filter the array to only
  // include new actions which don't already exist in resourceActions.
  const updatedActions = newActions.map(action => validator.escape(action))
    .filter(action => notEmptyOrInList(action, oldActions))

  // House cleaning: make sure there are no duplicates or empty strings in the
  // existing list of actions before saving the new actions into it. This
  // technique uses the array.reduce accumulator to build a new array from
  // checking if each element of app.actions already exists yet in it and
  // only adding unique values.
  // source: http://stackoverflow.com/a/15868720
  const uniqueActions = oldActions.reduce((acc, action) => {
    return notEmptyOrInList(action, acc) ? [...acc, action] : acc
  }, [...updatedActions])

  return [...uniqueActions, ...updatedActions]
}

// Cycle through each of removedActions[] and remove those that match from
// actions[].
const removeActions = (actions, removedActions) => {
  return removedActions.reduce((remainingActions, action) => {
    const index = remainingActions.indexOf(action)

    return [
      ...remainingActions.slice(0, index),
      ...remainingActions.slice(index + 1)
    ]
  }, [...actions])
}

module.exports = ResourceSchema
