'use strict'

const router = require('express').Router()
const cred = require('../cred')
const {
  postResources,
  getResources,
  getResource,
  putResource,
  deleteResource,
  putActions,
  getActions,
  deleteActions
} = require('../controllers/resource_controller')

const requireReadResource = cred.requirePermission('resources:read')
const requireWriteResource = cred.requirePermission('resources:write')

router.route('/resources')
  .post(requireWriteResource, postResources)
  .get(requireReadResource, getResources)

router.route('/resources/:id')
  .get(requireReadResource, getResource)
  .put(requireWriteResource, putResource)
  .delete(requireWriteResource, deleteResource)

router.route('/resources/:id/actions')
  .put(requireWriteResource, putActions)
  .get(requireReadResource, getActions)
  .delete(requireWriteResource, deleteActions)

module.exports = router
