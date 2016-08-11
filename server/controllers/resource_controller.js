'use strict'

//const validator = require('validator')
const { createError, BAD_REQUEST, FORBIDDEN } = require('../helpers/error_helper')
const { Resource } = require('../models')

// POST /resources
const postResources = (req, res, next) => {
  const resourceName = req.body.name

  Resource.findOne({ where: { name: resourceName } })
    .then(resource => {
      if (resource) throw createError({
        status: FORBIDDEN,
        message: 'A resource by that name already exists'
      })

      return Resource.create(req.body)
    })
    .then(resource => res.json({
      success: true,
      message: 'Resource created',
      resource
    }))
    .catch(next)
}

// GET /resources
const getResources = (req, res, next) => {
  Resource.findAll()
    .then(resources => res.json({
      success: true,
      message: 'Resources found',
      resources
    }))
    .catch(next)
}

// GET /resources/:resource_name
const getResource = (req, res, next) => {
  const resourceName = req.params.resource_name

  Resource.findOne({ where: { name: resourceName } })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      res.json({
        success: true,
        message: 'Resource found',
        resource
      })
    })
    .catch(next)
}

// PUT /resources/:resource_name
const putResource = (req, res, next) => {
  const resourceName = req.params.resource_name

  Resource.findOne({ where: { name: resourceName } })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      Object.keys(req.body).forEach(key => {
        if (resource.hasOwnProperty(key)) resource[key] = req.body[key]
      })

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Resource updated',
      resource
    }))
    .catch(next)
}

// DELETE /resources/:resource_name
// TODO: when deleting an resource, also cycle through all users and remove any
// references to the deleted resource from their permissions.
const deleteResource = (req, res, next) => {
  const resourceName = req.params.resource_name

  Resource.findOne({ where: { name: resourceName } })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      return resource.destroy()
    })
    .then(resource => res.json({
      success: true,
      message: 'Resource deleted',
      resource
    }))
    .catch(next)
}

// POST /resources/:resource_name/actions
const postActions = (req, res, next) => {
  const resourceName = req.params.resource_name
  const actions = req.body.actions

  if (!actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions were provided to be added'
  }))

  Resource.findOne({ where: { name: resourceName } })
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      resource.addActions(actions)

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Actions updated',
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
        message: 'Actions found',
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
    message: 'No actions were provided to be deleted'
  }))

  Resource.findOne(resourceName)
    .then(resource => {
      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with the name '${ resourceName }'`
      })

      resource.removeActions(actions)

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Actions removed',
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
