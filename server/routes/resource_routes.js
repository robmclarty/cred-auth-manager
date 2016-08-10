'use strict'

const router = require('express').Router()
const cred = require('../cred')
const {
  postResources,
  getResources,
  getResource,
  putResource,
  deleteResource,
  postActions,
  getActions,
  deleteActions
} = require('../controllers/resource_controller')

const requireReadResource = cred.requirePermission('resource:read')
const requireWriteResource = cred.requirePermission('resource:write')

router.route('resources')
  .post(requireWriteResource, postResources)
  .get(requireReadResource, getResources)

router.route('resources/:resource_name')
  .get(requireReadResource, getResource)
  .put(requireWriteResource, putResource)
  .delete(requireWriteResource, deleteResource)

router.route('resources/:resource_name/actions')
  .post(requireWriteResource, postActions)
  .get(requireReadResource, getActions)
  .delete(requireWriteResource, deleteActions)

module.exports = router
