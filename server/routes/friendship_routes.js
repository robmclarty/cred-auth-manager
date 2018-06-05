'use strict'

const { requireOwner } = require('../middleware/basic_permissions')
const {
  getFriendships,
  postFriendships,
  deleteFriendships,
  getFriendship,
  deleteFriendship,
  updateFriendshipStatus
} = require('../controllers/friendship_controller')

const friendshipRoutes = express => {
   const router = express.Router()

  router.route('/users/:user_id/friendships')
    .all(requireOwner)
    .get(getFriendships)
    .post(postFriendships)
    .delete(deleteFriendships)

  router.route('/users/:user_id/friendships/:friendship_id')
    .all(requireOwner)
    .get(getFriendship)
    .delete(deleteFriendship)

  return router
}

module.exports = friendshipRoutes
