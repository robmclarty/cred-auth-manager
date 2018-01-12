'use strict'

const express = require('express')
const router = express.Router()
const { requireOwner } = require('../middleware/basic_permissions')
const {
  ACCEPTED,
  DECLINED,
  REJECTED
} = require('../constants/friendship_status')
const {
  postFriends,
  getFriends,
  getFriend,
  putFriend,
  deleteFriend,
  getPendingFriends,
  updateFriendStatus
} = require('../controllers/friendship_controller')

router.route('/users/:user_id/friends')
  .all(requireOwner)
  .post(postFriends)
  .get(getFriends)

router.route('/users/:user_id/friends/pending')
  .get(requireOwner, getPendingFriends)

router.route('/users/:user_id/friends/:friend_id')
  .all(requireOwner)
  .get(getFriend)
  .put(putFriend)
  .delete(deleteFriend)

router.route('/users/:user_id/friends/:friend_id/accept')
  .post(requireOwner, updateFriendStatus(ACCEPTED))

router.route('/users/:user_id/friends/:friend_id/decline')
  .post(requireOwner, updateFriendStatus(DECLINED))

router.route('/users/:user_id/friends/:friend_id/reject')
  .post(requireOwner, updateFriendStatus(REJECTED))

module.exports = router
