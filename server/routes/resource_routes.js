'use strict'

const router = require('express').Router()
const { authorizedAccess } = require('../auth')
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
  .all(authorizedAccess.requirePermission('admin'))
  .post(postResources)
  .get(getResources)

router.route('resources/:resource_name')
  .all(authorizedAccess.requirePermission('admin'))
  .get(getResource)
  .put(putResource)
  .delete(deleteResource)

router.route('resources/:resource_name/actions')
  .all(authorizedAccess.requirePermission('admin'))
  .post(postActions)
  .get(getActions)
  .delete(deleteActions)

module.exports = router;
