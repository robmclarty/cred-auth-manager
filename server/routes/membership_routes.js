'use strict'

const { requireOwner } = require('../middleware/basic_permissions')
const {
  postMemberships,
  deleteMembership
} = require('../controllers/membership_controller')

const membershipRoutes = express => {
  const router = express.Router()

  router.route('/groups/:group_id/users')
    .post(requireOwner, postMemberships)

  router.route('/groups/:group_id/users/:user_id')
    .delete(requireOwner, deleteMembership)

  return router
}

module.exports = membershipRoutes
