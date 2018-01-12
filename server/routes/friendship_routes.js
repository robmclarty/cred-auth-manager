'use strict'

const express = require('express')
const router = express.Router()
const { requireOwner } = require('../middleware/basic_permissions')
const {
  getFriendships,
  postFriendships,
  deleteFriendships,
  getFriendship,
  deleteFriendship,
  updateFriendshipStatus
} = require('../controllers/friendship_controller')

router.route('/users/:user_id/friendships')
  .all(requireOwner)
  .get(getFriendships)
  .post(postFriendships)
  .delete(deleteFriendships)

router.route('/users/:user_id/friendships/:friendship_id')
  .all(requireOwner)
  .get(getFriendship)
  .delete(deleteFriendship)

module.exports = router
