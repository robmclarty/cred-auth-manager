'use strict'

const friendshipStatus = require('../../constants/friendship_status')

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Friendships', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      friendId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: friendshipStatus.FRIENDSHIP_STATUSES,
        defaultValue: friendshipStatus.PENDING
      },
      acceptedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },
      requestedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },
      declinedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },
      rejectedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },
      bannedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Friendships')
  }
}
