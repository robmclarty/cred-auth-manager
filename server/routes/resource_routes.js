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

router.route('resources')
  .all(cred.requirePermission('admin'))
  .post(postResources)
  .get(getResources)

router.route('resources/:resource_name')
  .all(cred.requirePermission('admin'))
  .get(getResource)
  .put(putResource)
  .delete(deleteResource)

router.route('resources/:resource_name/actions')
  .all(cred.requirePermission('admin'))
  .post(postActions)
  .get(getActions)
  .delete(deleteActions)

module.exports = router
