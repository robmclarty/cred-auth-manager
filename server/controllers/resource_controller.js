'use strict'

const striptags = require('striptags')
const URLSafe = require('urlsafe-base64')
const { createError, BAD_REQUEST, FORBIDDEN } = require('../helpers/error_helper')
const Resource = require('../models/resource')

// Take an existing array of resource actions and merge them with a new array
// of actions. Filter out duplicates and strip any html tags to ensure that the
// array of actions returned is a set of safe, unique, strings.
// TODO: Maybe move this to the Resource model as a pre-save action.
const updatedActions = ({ oldActions = [], newActions = [] }) => {
  // Strip any tags in any of the actions and then filter the array to only
  // include new actions which don't already exist in resourceActions.
  const updatedActions = newActions.map(action => striptags(action))
    .filter(action => (action !== '' && oldActions.indexOf(action) < 0))

  // House cleaning: make sure there are no duplicates or empty strings in the
  // existing list of actions before saving the new actions into it. This
  // technique uses the array.reduce accumulator to build a new array from
  // checking if each element of app.actions already exists yet in it and
  // only adding unique values.
  // source: http://stackoverflow.com/a/15868720
  const uniqueActions = oldActions.reduce((acc, action) => {
    return acc.indexOf(action) < 0 && action !== '' ?
      [...acc, action] :
      acc
  }, [...updatedActions])

  return [...uniqueActions, ...updatedActions]
}

// At the router level, only admins are allowed to execute any of these functions.
const updatedResource = ({ targetResource = {}, updates = {} }) => {
  const resource = Object.assign({}, targetResource)

  if (updates.hasOwnProperty('name')) resource.name = striptags(updates.name)
  if (updates.hasOwnProperty('url')) resource.url = striptags(updates.url)
  if (updates.hasOwnProperty('actions')) resource.actions = updatedActions({
    oldActions: targetResource.actions,
    newActions: updates.actions
  })
  if (updates.hasOwnProperty('isActive')) resource.isActive = updates.isActive

  return resource
}

const getResources = (req, res, next) => {
  Resource.find({})
    .then(resources => res.json({
      success: true,
      message: 'Resources found.',
      resources
    }))
    .catch(next)
}

const postResources = (req, res, next) => {
  if (!req.body.name || !URLSafe.validate(req.body.name)) {
    return next(createError({
      status: BAD_REQUEST,
      message: 'Badly formatted resource name; must be URLSafe.'
    }))
  }

  if (!req.body.url || !URLSafe.validate(req.body.url)) {
    return next(createError({
      status: BAD_REQUEST,
      message: 'Badly formatted resource url.'
    }))
  }

  Resource.findOne({ name: req.body.name })
    .then(existingResource => {
      if (existingResource) throw createError({
        status: FORBIDDEN,
        message: 'An app by that name already exists.'
      })

      const resource = updatedResource({
        targetResource: new Resource(),
        updates: req.body
      })

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Resource created.',
      resource
    }))
    .catch(next)
}

const getResource = (req, res, next) => {
  Resource.findOne({ name: req.params.resource_name })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ req.params.resource_name }'`
      })

      res.json({
        success: true,
        message: 'Resource found.',
        resource
      })
    })
    .catch(next)
}

// Only allow updates to explicitly defined fields. So, for example, actions
// need to be updated through their own endpoint and can't be changed here.
// Also, all html tags are stripped from string fields to prevent any kind
// of XSS attack.
const putResource = (req, res, next) => {
  if (!req.body.name || !URLSafe.validate(req.body.name)) {
    return next(createError({
      status: BAD_REQUEST,
      message: 'Badly formatted resource name; must be URLSafe.'
    }))
  }

  Resource.findOne({ name: req.params.resource_name })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ req.params.resource_name }'.`
      })

      return updatedResource({
        targetResource: resource,
        updates: req.body
      })
    })
    .then(resource => resource.save())
    .then(resource => {
      res.json({
        success: true,
        message: 'Resource updated',
        resource
      });
    })
    .catch(next)
}

// TODO: when deleting an resource, also cycle through all users and remove any
// references to the deleted resource from their permissions.
const deleteResource = (req, res, next) => {
  Resource.findOne({ name: req.params.resource_name })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ req.params.resource_name }'`
      })

      return resource.remove()
    })
    .then(resource => res.json({
      success: true,
      message: 'Resource deleted.',
      resource
    }))
    .catch(next)
}

const postActions = (req, res, next) => {
  Resource.findOne(req.params.resource_name)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ req.params.resource_name }'`
      })

      // If no actions are provided, the existing actions will be returned.
      resource.actions = updatedActions({
        oldActions: resource.actions,
        newActions: req.body.actions
      })

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Actions updated.',
      actions: resource.actions
    }))
    .catch(next)
}

const getActions = (req, res, next) => {
  Resource.findOne(req.params.resource_name)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ req.params.resource_name }'`
      })

      res.json({
        success: true,
        message: 'Actions found.',
        actions: resource.actions
      })
    })
    .catch(next)
}

// Requires a variable called "actions" which is an array of strings sent in the
// body containing a list of actions to be removed.
const deleteActions = (req, res, next) => {
  // Cycle through each of removedActions[] and remove those that match from
  // actions[].
  const sliceActions = (actions, removedActions) => {
    return removedActions.reduce((remainingActions, action) => {
      const index = remainingActions.indexOf(action)

      return [
        ...remainingActions.slice(0, index),
        ...remainingActions.slice(index + 1)
      ]
    }, [...actions])
  }

  Resource.findOne(req.params.resource_name)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ req.params.resource_name }'`
      })

      if (!req.body.actions) throw createError({
        status: BAD_REQUEST,
        message: 'No actions were provided to be deleted.'
      })

      // Remove req.body.actions from resource.actions.
      resource.actions = sliceActions(resource.actions, req.body.actions)

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Actions removed.',
      resource
    }))
    .catch(next)
}

Object.assign(exports, {
  getResources,
  postResources,
  getResource,
  putResource,
  deleteResource,
  postActions,
  getActions,
  deleteActions
})
