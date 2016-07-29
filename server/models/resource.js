'use strict'

const mongoose = require('mongoose')
const validator = require('validator')
const base64url = require('base64-url')

// A "resource" in this context is a pointer to some resource in the cloud that
// will make use of this auth system. That is, some other server that will
// authenticate its requests using JWTs generated from this server and which
// uses the public-key for verifying the access-token.
//
// Resource servers can also, optionally, make use of a set of specific
// permission actions to manage a more granular authorization system. The
// `actions` array in the ResourceSchema is a list of strings which act as keys
// for possible permissions that the resource server understands (it can just
// be left blank too).
//
// NOTE: The permissions-based authorization only works if the resource server
// itself implements checks for those permitted actions on its endpoints. This
// server merely provides the facility for setting actions for a resource on
// the user's account and generates access-tokens which include them.
const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
    validate: {
      validator: value => validator.matches(value, /^[A-Za-z0-9\-_]+$/),
      message: '{ VALUE } must be URL-safe (use hyphens instead of spaces, like "my-amazing-resource")'
    }
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: validator.isURL,
      message: '{ VALUE } is not a valid URL.'
    }
  },
  actions: [String],
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
})

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

// Helper Methods
// --------------

const notEmptyOrInList = (value, list) => value !== '' && !list.includes(value)

// Pre-save Methods
// ----------------

ResourceSchema.pre('save', function (next) {
  const sanitizedResource = sanitizeResource(this)

  Object.keys(sanitizedResource).forEach(key => {
    this[key] = sanitizedResource[key]
  })

  this.updatedAt = Date.now()

  next()
})

// Static Methods
// --------------

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

Object.assign(ResourceSchema.statics, {
  updateActions,
  removeActions
})

module.exports = mongoose.model('Resource', ResourceSchema)
