'use strict'

const {
  createError,
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND
} = require('../helpers/error_helper')
const {
  REQUESTED,
  PENDING,
  ACCEPTED,
  DECLINED,
  REJECTED,
  BANNED,
  FRIENDSHIP_STATUSES
} = require('../constants/friendship_status')
const {
  findLinkedFriendships,
  createMutualFriendships,
  getMutualFriendships,
  updateFriendshipStatus,
  findSentReceivedFriendships
} = require('../helpers/friend_helper')

const postFriends = (req, res, next) => {
  const userId = req.params.user_id
  const userIds = req.body.user_ids || []
  const emails = req.body.emails || []
  const usernames = req.body.usernames || []

  createMutualFriendships({ userId, userIds, emails, usernames })
    .then(friendships => res.json({
      ok: true,
      message: 'Friendships created',
      friendships
    }))
    .catch(next)
}

const getFriends = (req, res, next) => {
  getMutualFriendships(req.params.user_id)
    .then(friendships => res.json({
      ok: true,
      message: 'Found user friends',
      friends: friendships.map(friendship => friendship.friend)
    }))
    .catch(next)
}

const getFriendship = (req, res, next) => {
  const userId = req.params.user_id
  const friendId = req.params.friend_id

  findLinkedFriendships(userId, friendId)
    .then(([userFriendship, friendFriendship]) => res.json({
      ok: true,
      message: 'Friendships found.',
      userFriendship,
      friendFriendship
    }))
    .catch(next)
}

const deleteFriendship = (req, res, next) => {
  const { Friendship } = req.app.models

  Friendship.findOne({
    where: {
      userId: req.params.user_id,
      friendId: req.params.friend_id
    }
  })
    .then(friendship => friendship.update({ status: REJECTED }))
    .then(() => res.json({
      ok: true,
      message: 'Friendship rejected'
    }))
    .catch(next)
}

const getPendingFriends = (req, res, next) => {
  const userId = req.params.user_id

  findSentReceivedFriendships(userId)
    .then(([sentFriendships, receivedFriendships]) => res.json({
      ok: true,
      message: 'User friendships found',
      friendships: {
        sent: sentFriendships.map(f => ({
          id: f.user.id,
          username: f.user.username,
          issuedAt: f.createdAt
        })),
        received: receivedFriendships.map(f => ({
          id: f.friend.id,
          username: f.friend.username,
          issuedAt: f.createdAt
        }))
      }
    }))
    .catch(next)
}

const updateFriendStatus = newStatus => (req, res, next) => {
  const userId = req.params.user_id
  const friendId = req.params.friend_id

  updateFriendshipStatus(userId, friendId, newStatus)
    .then(friendship => res.json({
      ok: true,
      message: `Friendship status updated to '${ newStatus }'`,
      friendship
    }))
    .catch(next)
}

module.exports = {
  postFriends,
  getFriends,
  getFriend,
  putFriend,
  deleteFriend,
  getPendingFriends,
  updateFriendStatus
}
