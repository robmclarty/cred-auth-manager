'use strict'

const validator = require('validator')
const { createError, BAD_REQUEST, FORBIDDEN } = require('../helpers/error_helper')
const Resource = require('../models/resource')

// POST /resources
const postResources = (req, res, next) => {
  const resourceName = String(req.body.name)

  Resource.findOne({ name: resourceName })
    .then(existingResource => {
      if (existingResource) throw createError({
        status: FORBIDDEN,
        message: 'An app by that name already exists.'
      })

      const resource = new Resource(req.body)

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Resource created.',
      resource
    }))
    .catch(next)
}

// GET /resources
const getResources = (req, res, next) => {
  Resource.find({})
    .then(resources => res.json({
      success: true,
      message: 'Resources found.',
      resources
    }))
    .catch(next)
}

// GET /resources/:resource_name
const getResource = (req, res, next) => {
  const resourceName = String(req.params.resource_name)

  Resource.findOne({ name: resourceName })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      res.json({
        success: true,
        message: 'Resource found.',
        resource
      })
    })
    .catch(next)
}

// PUT /resources/:resource_name
// Only allow updates to explicitly defined fields. So, for example, actions
// need to be updated through their own endpoint and can't be changed here.
// Also, all html tags are stripped from string fields to prevent any kind
// of XSS attack.
const putResource = (req, res, next) => {
  const resourceName = String(req.params.resource_name)

  Resource.findOne({ name: resourceName })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'.`
      })

      Object.keys(req.body).forEach(key => {
        resource[key] = req.body[key]
      })

      return resource.save()
    })
    .then(resource => {
      res.json({
        success: true,
        message: 'Resource updated',
        resource
      });
    })
    .catch(next)
}

// DELETE /resources/:resource_name
// TODO: when deleting an resource, also cycle through all users and remove any
// references to the deleted resource from their permissions.
const deleteResource = (req, res, next) => {
  const resourceName = String(req.params.resource_name)

  Resource.findOne({ name: resourceName })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
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

// POST /resources/:resource_name/actions
const postActions = (req, res, next) => {
  const resourceName = String(req.params.resource_name)
  const actions = req.body.actions

  if (!actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions were provided to be add.'
  }))

  Resource.findOne(resourceName)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      // If no actions are provided, the existing actions will be returned.
      resource.actions = Resource.updateActions({
        oldActions: resource.actions,
        newActions: actions
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

// GET /resources/:resource_name/actions
const getActions = (req, res, next) => {
  const resourceName = String(req.params.resource_name)

  Resource.findOne(resourceName)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      res.json({
        success: true,
        message: 'Actions found.',
        actions: resource.actions
      })
    })
    .catch(next)
}

// DELETE /resources/:resource_name/actions
// Requires a variable called "actions" which is an array of strings sent in the
// body containing a list of actions to be removed.
const deleteActions = (req, res, next) => {
  const resourceName = String(req.params.resource_name)
  const actions = req.body.actions

  if (!actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions were provided to be deleted.'
  }))

  Resource.findOne(resourceName)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      // Remove req.body.actions from resource.actions.
      resource.actions = Resource.removeActions(resource.actions, actions)

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
