'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('Users', 'facebookId', Sequelize.STRING),
      queryInterface.addColumn('Users', 'githubId', Sequelize.STRING),
      queryInterface.addColumn('Users', 'twitterId', Sequelize.STRING),
      queryInterface.addColumn('Users', 'googleId', Sequelize.STRING)
    ])
  },

  down: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Users', 'facebookId'),
      queryInterface.removeColumn('Users', 'githubId'),
      queryInterface.removeColumn('Users', 'twitterId'),
      queryInterface.removeColumn('Users', 'googleId')
    ])
  }
}
