'use strcit'

const {
  REQUESTED,
  PENDING,
  ACCEPTED,
  DECLINED,
  REJECTED,
  BANNED,
  FRIENDSHIP_STATUSES
} = require('../constants/friendship_status')

const findFriendshipById = (Friendship, id) => Friendship.findById(id).then(friendship => {
  if (!friendship) throw createError({
    status: NOT_FOUND,
    message: `No friendship found with the id '${ id }'`
  })

  return friendship
})

const findLinkedFriendships = (Friendship, userId, friendId) => Promise.all([
  Friendship.findOne({
    where: {
      userId,
      friendId
    }
  }),
  Friendship.findOne({
    where: {
      userId: friendId,
      friendId: userId
    }
  })
])

// Take an array of email addresses and return an array of user ids which
// correspond to user accounts containing matching email addresses.
const getUserIdsFromEmails = (User, emails) => User.findAll({
  where: {
    email: {
      $or: emails
    }
  }
}).then(users => users.map(user => user.id))

// Take an array of usernames and return an array of user ids which
// correspond to user accounts containing matching usernames.
const getUserIdsFromUsernames = (User, usernames) => User.findAll({
  where: {
    username: {
      $or: usernames
    }
  }
}).then(users => users.map(user => user.id))

// Create a new friendship for a user. This involves the creation of two
// "friendships" between each user such that the current user has ACCEPTED
// friendships pointing towards each friend whereas each friend has PENDING
// friendships pointing back towards the user.

// Find users based on *either* `userIds`, `emails`, or `usernames` exclusively.
const getUserIds = ({ User, userIds = [], emails = [], usernames = [] }) => {
  return emails.length > 0 ?
    getUserIdsFromEmails(User, emails) :
    usernames.length > 0 ?
      getUserIdsFromUsernames(User, usernames) :
      userIds
}

// TODO: create a MUTUAL friendship (i.e., 2 ACCEPTED friendships in both directions)
const createMutualFriendships = ({
  models,
  userId,
  userIds = [],
  emails = [],
  usernames = []
}) => {
  const { Friendship, User, Metadata } = models

  if (!userId || (!userIds && !emails && !usernames)) return false

  const isFriend = id => friendship => friendship.friendId === id
  const newFriends = friendships => id => friendships.findIndex(isFriend(id)) < 0
  const existingFriends = friendships => id => friendships.findIndex(isFriend(id)) >= 0

  return Promise.all([
    Friendship.findAll({ where: { userId } }),
    getUserIds({ User, userIds, emails, usernames })
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

// Return a promise to get all mutual friendships for userId.
// Get a filtered version of userFriendships which only includes those
// friendships which are also held in otherFriendships in reverse (i.e.,
// others who are also friends with user.
const getMutualFriendships = (Friendship, userId) => {
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

const changeFriendshipStatus = (models, userId, friendId, newStatus) => new Promise((resolve, reject) => {
  const { Friendship, User, Metadata } = models

  if (!userId) return reject('No userId provided')
  if (!friendId) return reject('No friendId provided')
  if (!newStatus) return reject('No status provided')
  if (typeof userId !== 'number') return reject('userId must be a Number')
  if (typeof friendId !== 'number') return reject('friendId must be a Number')
  if (!FRIENDSHIP_STATUSES.includes(newStatus)) return reject('invalid status')

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
    .then(([userFriendship, friendFriendship]) => {
      if (!userFriendship || !friendFriendship) reject(`No friendship found with userId '${ userId }', friendId '${ friendId }'`)

      const userUpdates = { status: newStatus }
      const friendUpdates = {}

      // If otherFriendship is currently in a state of REQUESTED, then change its
      // status to PENDING to remove it from the user's list of requested contacts.
      if (friendFriendship.status === REQUESTED) friendUpdates.status = PENDING

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
        friendUpdates.status = REJECTED
        break
      }

      return Promise.all([
        userFriendship.update(userUpdates),
        friendFriendship.update(friendUpdates)
      ])
    })
    .then(([userFriendship, friendFriendship]) => resolve(userFriendship))
})

// Helper function for retrieving sent and received pending friendships (aka
// "friend requests").
const findSentReceivedFriendships = (models, userId) => {
  const { Friendship, User, Metadata } = models

  return Promise.all([
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
}

module.exports = {
  findFriendshipById,
  findLinkedFriendships,
  createMutualFriendships,
  getMutualFriendships,
  findSentReceivedFriendships,
  changeFriendshipStatus
}
