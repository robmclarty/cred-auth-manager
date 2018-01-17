'use strict';

const { User } = require('../../server/models')

module.exports = {
  up: function (queryInterface, Sequelize) {
    return User.create({
      username: 'admin',
      password: 'password',
      email: 'admin@email.com',
      phone: '1234567890',
      isActive: true,
      isAdmin: true
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
