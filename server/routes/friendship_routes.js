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
  postUserFriendships,
  getUserFriends
} = require('../controllers/friendship_controller')

router.route('/friendships')
  .all(requireOwner)
  .get(getFriendships)
  .post(postFriendships)

router.route('/friendships/:friendship_id')
  .all(requireOwner)
  .get(getFriendship)
  .put(putFriendship)
  .delete(deleteFriendship)

router.route('/users/:user_id/friendships')
  .all(requireOwner)
  .get(getUserFriendships)
  .post(postUserFriendships)

router.route('/users/:user_id/friends')
  .all(requireOwner)
  .get(getUserFriends)

module.exports = router
