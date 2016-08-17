'use strict'

const { createError, BAD_REQUEST, CONFLICT, NOT_FOUND } = require('../helpers/error_helper')
const { Resource } = require('../models')

const findResourceById = resourceId => Resource.findById(resourceId)
  .then(resource => {
    if (!resource) throw createError({
      status: NOT_FOUND,
      message: `No resource found with the id '${ resourceId }'`
    })

    return resource
  })

// POST /resources
const postResources = (req, res, next) => {
  const resourceName = req.body.name

  Resource.create(req.body)
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

// GET /resources/:id
const getResource = (req, res, next) => {
  const resourceId = req.params.id

  findResourceById(resourceId)
    .then(resource => res.json({
      success: true,
      message: 'Resource found',
      resource
    }))
    .catch(next)
}

// PUT /resources/:id
const putResource = (req, res, next) => {
  const resourceId = req.params.id

  findResourceById(resourceId)
    .then(resource => resource.update(req.body))
    .then(resource => res.json({
      success: true,
      message: 'Resource updated',
      resource
    }))
    .catch(next)
}

// DELETE /resources/:id
// TODO: when deleting an resource, also cycle through all users and remove any
// references to the deleted resource from their permissions.
const deleteResource = (req, res, next) => {
  const resourceId = req.params.id

  findResourceById(resourceId)
    .then(resource => resource.destroy())
    .then(resource => res.json({
      success: true,
      message: 'Resource deleted'
    }))
    .catch(next)
}

// GET /resources/:id/actions
const getActions = (req, res, next) => {
  const resourceId = req.params.id

  findResourceById(resourceId)
    .then(resource => res.json({
      success: true,
      message: 'Actions found',
      actions: resource.actions
    }))
    .catch(next)
}

// PUT /resources/:id/actions
const putActions = (req, res, next) => {
  const resourceId = req.params.id
  const actions = req.body.actions

  if (!actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions were provided to be added'
  }))

  findResourceById(resourceId)
    .then(resource => {
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

// DELETE /resources/:id/actions
// Requires a variable called "actions" which is an array of strings sent in the
// body containing a list of actions to be removed.
const deleteActions = (req, res, next) => {
  const resourceId = req.params.id
  const actions = req.body.actions

  if (!actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions were provided to be deleted'
  }))

  findResourceById(resourceId)
    .then(resource => {
      resource.removeActions(actions)

      return resource.save()
    })
    .then(resource => res.json({
      success: true,
      message: 'Actions removed',
      actions: resource.actions
    }))
    .catch(next)
}

module.exports = {
  getResources,
  postResources,
  getResource,
  putResource,
  deleteResource,
  putActions,
  getActions,
  deleteActions
}
