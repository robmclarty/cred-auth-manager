'use strict'

const friendshipStatus = require('../constants/friendship_status')

const toJSON = friendship => ({
  id: friendship.id,
  userId: friendship.userId,
  friendId: friendship.friendId,
  status: friendship.status,
  acceptedAt: friendship.acceptedAt,
  requestedAt: friendship.requestedAt,
  declinedAt: friendship.declinedAt,
  rejectedAt: friendship.rejectedAt,
  bannedAt: friendship.bannedAt,
  createdAt: friendship.createdAt,
  updatedAt: friendship.updatedAt
})

// A join table between two different users depicting a friendship/relationship.
const FriendshipSchema = (sequelize, DataTypes) => {
  const Friendship = sequelize.define('Friendship', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    friendId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: friendshipStatus.FRIENDSHIP_STATUSES,
      defaultValue: friendshipStatus.PENDING
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    declinedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    bannedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    }
  },
  {
    name: {
      singular: 'friendship',
      plural: 'friendships'
    },
    tableName: 'Friendships',
    classMethods: {
      associate: models => {
        Friendship.belongsTo(models.User, {
          foreignKey: 'userId'
        })
        Friendship.belongsTo(models.User, {
          as: 'friend',
          foreignKey: 'friendId'
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return toJSON(this.get())
      }
    }
  })

  return Friendship
}

module.exports = FriendshipSchema
