'use strict'

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
const {
  requireReadResource,
  requireWriteResource
} = require('../middleware/resource_permission_middleware')

const resourceRoutes = express => {
  const router = express.Router()

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

  return router
}

module.exports = resourceRoutes
