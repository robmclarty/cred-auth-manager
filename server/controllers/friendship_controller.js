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
  BANNED
} = require('../constants/friendship_status')
const { Friendship, User, Metadata } = require('../models')

const findFriendshipById = id => Friendship.findById(id).then(friendship => {
  if (!friendship) throw createError({
    status: NOT_FOUND,
    message: `No friendship found with the id '${ id }'`
  })

  return friendship
})

// Return a promise to get all mutual friendships for userId.
// Get a filtered version of userFriendships which only includes those
// friendships which are also held in otherFriendships in reverse (i.e.,
// others who are also friends with user.
const getMutualFriendships = userId => {
  const isMutualFriend = friendship => otherFriendship => {
    return friendship.friendId === otherFriendship.userId
  }

  const mutualFriendships = otherFriendships => friendship => {
    return otherFriendships.findIndex(isMutualFriend(friendship)) >= 0
  }

  return Promise.all([
    Friendship.findAll({
      where: {
        userId,
        status: ACCEPTED
      },
      include: [{
        model: User,
        as: 'friend',
        include: [Metadata]
      }]
    }),
    Friendship.findAll({
      where: {
        friendId: userId,
        status: ACCEPTED
      }
    })
  ])
    .then(([userFriendships, otherFriendships]) => {
      return userFriendships.filter(mutualFriendships(otherFriendships))
    })
}

// POST /friendships
const postFriendships = (req, res, next) => {
  const friendshipName = req.body.name

  Friendship.create(req.body)
    .then(friendship => res.json({
      ok: true,
      message: 'Friendship created',
      friendship
    }))
    .catch(next)
}

// GET /friendships
const getFriendships = (req, res, next) => {
  Friendship.findAll()
    .then(friendships => res.json({
      ok: true,
      message: 'Friendships found',
      friendships
    }))
    .catch(next)
}

// GET /friendships/:friendship_id
const getFriendship = (req, res, next) => {
  findFriendshipById(req.params.friendship_id)
    .then(friendship => res.json({
      ok: true,
      message: 'Friendship found',
      friendship
    }))
    .catch(next)
}

// PUT /friendships/:friendship_id
const putFriendship = (req, res, next) => {
  findFriendshipById(req.params.friendship_id)
    .then(friendship => friendship.update(req.body))
    .then(friendship => res.json({
      ok: true,
      message: 'Friendship updated',
      friendship
    }))
    .catch(next)
}

// DELETE /friendships/:friendship_id
//
// TODO: when deleting an friendship, also cycle through all users and remove any
// references to the deleted friendship from their permissions.
const deleteFriendship = (req, res, next) => {
  findFriendshipById(req.params.friendship_id)
    .then(friendship => friendship.destroy())
    .then(friendship => res.json({
      ok: true,
      message: 'Friendship deleted'
    }))
    .catch(next)
}

// POST /users/:user_id/contact-requests/:friend_id/:status
// DELETE /users/:user_id/contact-requests/:friend_id
const updateFriendshipStatus = newStatus => (req, res, next) => {
  const userId = req.params.user_id
  const friendId = req.params.friend_id

  Promise.all([
    Friendship.findOne({
      where: {
        userId,
        friendId
      },
      include: [
        {
          model: User,
          include: [Metadata]
        },
        {
          model: User,
          as: 'friend',
          include: [Metadata]
        }
      ]
    }),
    Friendship.findOne({
      where: {
        userId: friendId,
        friendId: userId
      }
    })
  ])
    .then(([userFriendship, otherFriendship]) => {
      if (!userFriendship || !otherFriendship) throw createError({
        status: NOT_FOUND,
        message: `No friendship found with userId '${ userId }', friendId '${ friendId }'`
      })

      const userUpdates = { status: newStatus }
      const otherUpdates = {}

      // If otherFriendship is currently in a state of REQUESTED, then change its
      // status to PENDING to remove it from the user's list of requested contacts.
      if (otherFriendship.status === REQUESTED) otherUpdates.status = PENDING

      // If newStatus is REJECTED, also reject the otherFriendship status.
      switch (newStatus) {
      case ACCEPTED:
        userUpdates.acceptedAt = Date.now()
        break
      case DECLINED:
        userUpdates.declinedAt = Date.now()
        break
      case REJECTED:
        userUpdates.rejectedAt = Date.now()
        otherUpdates.status = REJECTED
        break
      }

      return Promise.all([
        userFriendship.update(userUpdates),
        otherFriendship.update(otherUpdates)
      ])

      // If otherFriendship is currently in a state of REQUESTED, then change its
      // status to PENDING to remove it from the user's list of requested contacts.
      // return otherFriendship.status === REQUESTED ?
      //   Promise.all([userFriendship.update(userUpdates), otherFriendship.update({ status: PENDING })]) :
      //   Promise.all([userFriendship.update(userUpdates), otherFriendship])
    })
    .then(([userFriendship, otherFriendship]) => res.json({
      ok: true,
      message: `Friendship status updated to '${ newStatus }'`,
      contact: userFriendship.friend.toContact(),
      friendship: userFriendship
    }))
    .catch(next)
}

// REFACTOR: The following functions are meant to map onto the old API style
// which dealth with "contact requests" rather than "friendships" so this may
// seem a little wonky at the moment. In a future refactor these could be made
// to talk about "friendships" to be more consistent.

// Take an array of email addresses and return an array of user ids which
// correspond to user accounts containing matching email addresses.
const getUserIdsFromEmails = emails => User.findAll({
  where: {
    email: {
      $or: emails
    }
  }
}).then(users => users.map(user => user.id))

// Take an array of usernames and return an array of user ids which
// correspond to user accounts containing matching usernames.
const getUserIdsFromUsernames = usernames => User.findAll({
  where: {
    username: {
      $or: usernames
    }
  }
}).then(users => users.map(user => user.id))

// POST /users/:user_id/contacts
// POST /users/:user_id/contact-requests

// Create a new friendship for a user. This involves the creation of two
// "friendships" between each user such that the current user has ACCEPTED
// friendships pointing towards each friend whereas each friend has PENDING
// friendships pointing back towards the user.

// TODO: create a MUTUAL friendship (i.e., 2 ACCEPTED friendships in both directions)
const createMutualFriendships = ({
  userId,
  userIds = [],
  emails = [],
  usernames = []
}) => {
  if (!userId || (!userIds && !emails && !usernames)) return false

  const isFriend = id => friendship => friendship.friendId === id
  const newFriends = friendships => id => friendships.findIndex(isFriend(id)) < 0
  const existingFriends = friendships => id => friendships.findIndex(isFriend(id)) >= 0

  // Find users based on *either* `userIds`, `emails`, or `usernames` exclusively.
  const friendUserIdsPromise = emails.length > 0 ?
    getUserIdsFromEmails(emails) :
    usernames.length > 0 ?
      getUserIdsFromUsernames(usernames) :
      userIds

  return Promise.all([
    Friendship.findAll({ where: { userId } }),
    friendUserIdsPromise
  ])
    .then(([friendships, friendIds]) => Promise.all([
      friendIds.filter(newFriends(friendships)),
      friendIds.filter(existingFriends(friendships))
    ]))
    .then(([newFriendIds, existingFriendIds]) => {
      // Create all the friendships (from user => friend and friend => user) for
      // each newFriendId (i.e., friendships that do not yet exist as rows in db).
      const newUserFriendships = newFriendIds.map(friendId => ({
        userId,
        friendId,
        status: ACCEPTED,
        acceptedAt: Date.now()
      }))
      const newFriendFriendships = newFriendIds.map(friendId => ({
        userId: friendId,
        friendId: userId,
        status: REQUESTED,
        requestedAt: Date.now()
      }))

      // Two things need to happen: 1) create brand new friendships which are
      // accepted from my end and pending from the other end, and 2) update
      // any existing friendships such that all friendships are accepted from
      // my end but no change is made from the other end (they should keep
      // whatever their existing status is).
      return Promise.all([
        // Create new user => friend friendships.
        Friendship.bulkCreate(newUserFriendships),

        // Create new friend => user friendships.
        Friendship.bulkCreate(newFriendFriendships),

        // Change friendships to 'accepted' for all user's friendships to friend.
        Friendship.update({
          status: ACCEPTED,
          acceptedAt: Date.now()
        }, {
          where: {
            userId,
            friendId: {
              $or: existingFriendIds
            },
            status: {
              $ne: ACCEPTED
            }
          }
        }),

        // Change friendships to 'requested' for all existing friends, only if
        // they already exist and are not in a 'banned' state. If in banned
        // state, keep it banned (which prevents a new friendship from being
        // created. Also, don't change friendships that have already been
        // ACCEPTED either.
        Friendship.update({
          status: REQUESTED,
          requestedAt: Date.now()
        }, {
          where: {
            userId: {
              $or: existingFriendIds
            },
            friendId: userId,
            status: {
              $notIn: [BANNED, ACCEPTED]
            }
          }
        })
      ])
    })
    .then(() => Friendship.findAll({
      where: {
        userId
      },
      include: [{
        model: User,
        as: 'friend',
        include: [Metadata]
      }]
    }))
}

// POST /users/:user_id/friendships
const postUserFriendships = (req, res, next) => {
  const userId = req.params.user_id
  const userIds = req.body.user_ids || []
  const emails = req.body.emails || []
  const usernames = req.body.usernames || []

  createMutualFriendships({ userId, userIds, emails, usernames })
    .then(friendships => res.json({
      ok: true,
      message: 'User friendships created',
      friendships
    }))
    .catch(next)
}

// Helper function for retrieving sent and received pending friendships (aka
// "friend requests").
const findSentReceivedFriendships = userId => Promise.all([
  Friendship.findAll({
    where: {
      friendId: userId,
      status: REQUESTED
    },
    include: [{
      model: User,
      attributes: ['id', 'username'],
      include: [Metadata]
    }],
    order: [['updatedAt', 'DESC']]
  }),
  Friendship.findAll({
    where: {
      userId,
      status: REQUESTED
    },
    include: [{
      model: User,
      as: 'friend',
      attributes: ['id', 'username'],
      include: [Metadata]
    }],
    order: [['updatedAt', 'DESC']]
  })
])

// POST /users/:user_id/contact-requests
const postUserContactRequests = (req, res, next) => {
  const userId = req.params.user_id
  const userIds = req.body.user_ids || []
  const emails = req.body.emails || []
  const usernames = req.body.usernames || []

  createMutualFriendships({ userId, userIds, emails, usernames })
    .then(friendships => findSentReceivedFriendships(userId))
    .then(([sentFriendships, receivedFriendships]) => res.json({
      ok: true,
      message: 'User friendships created',
      contactRequests: {
        sent: sentFriendships.map(f => ({
          id: f.user.id,
          issuedAt: f.createdAt,
          username: f.user.username
        })),
        received: receivedFriendships.map(f => ({
          id: f.friend.id,
          issuedAt: f.createdAt,
          username: f.friend.username
        }))
      }
    }))
    .catch(next)
}

// GET /users/:user_id/contact-requests
const getPendingUserFriendships = (req, res, next) => {
  const userId = req.params.user_id

  findSentReceivedFriendships(userId)
    .then(([sentFriendships, receivedFriendships]) => res.json({
      ok: true,
      message: 'User friendships found',
      contactRequests: {
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

// DELETE /users/:user_id/contacts
// Remove multiple friendships.
const deleteUserFriendships = (req, res, next) => {
  Friendship.findAll({
    where: {
      userId: req.params.user_id,
      friendId: { or: req.body.user_ids }
    }
  })
    .then(friendships => friendship.update({ status: REJECTED }, {
      where: { id: friendships.map(f => f.id) }
    }))
    .catch(next)
}

// DELETE /users/:user_id/contacts/:friend_id
// Remove an individual friendship.
const deleteUserFriendship = (req, res, next) => {
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

// GET /users/:user_id/contacts
const getUserFriends = (req, res, next) => {
  getMutualFriendships(req.params.user_id)
    .then(friendships => res.json({
      ok: true,
      message: 'Found user friends',
      friends: friendships.map(friendship => friendship.friend)
    }))
    .catch(next)
}

// GET /users/:user_id/friendships
const getUserFriendships = (req, res, next) => {
  Friendship.findAll({
    where: {
      userId: req.params.user_id
    },
    include: [{
      model: User,
      attributes: ['id', 'username'],
      as: 'friend'
    }]
  })
    .then(friendships => res.json({
      ok: true,
      message: 'Found user friendships',
      friendships
    }))
    .catch(next)
}

module.exports = {
  getFriendships,
  postFriendships,
  getFriendship,
  putFriendship,
  deleteFriendship,
  postUserFriendships,
  getUserFriendships,
  getUserFriends
}
