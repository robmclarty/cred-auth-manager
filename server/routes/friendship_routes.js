'use strict'

const express = require('express')
const router = express.Router()
const { requireOwner } = require('../middleware/basic_permissions')
const {
  getFriendships,
  postFriendships,
  getFriendship,
  putFriendship,
  deleteFriendship,
  getUserFriendships,
  getPendingUserFriendships,
  postUserFriendships
} = require('../controllers/friendship_controller')

router.route('/friendships')
  .all(requireOwner)
  .get(getFriendships)
  .post(postFriendships)

router.route('/friendships/:friendship_id')
  .all(requireOwner)
  .get(getFriendship)
  .put(putFriendship)

router.route('/users/:user_id/friendships')
  .all(requireOwner)
  .get(getUserFriendships)
  .post(postUserFriendships)

module.exports = router
