'use strict';

const router = require('express').Router();
const {
  requireAdmin,
  requirePermission
} = require('../middleware/authorization_middleware');
const { requireValidAccessToken } = require('../middleware/token_middleware');
const {
  postResources,
  getResources,
  getResource,
  putResource,
  deleteResource,
  postActions,
  getActions,
  deleteActions
} = require('../controllers/resource_controller');

router.route('resources')
  .all(requireValidAccessToken, requireAdmin)
  .post(postResources)
  .get(getResources);

router.route('resources/:resource_name')
  .all(requireValidAccessToken, requirePermission('admin'))
  .get(getResource)
  .put(putResource)
  .delete(deleteResource);

router.route('resources/:resource_name/actions')
  .all(requireValidAccessToken, requirePermission('admin'))
  .post(postActions)
  .get(getActions)
  .delete(deleteActions);

module.exports = router;
