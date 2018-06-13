'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Resources', [{
      id: 1,
      name: 'cred-auth-manager',
      url: 'http://localhost:3000',
      actions: [
        'users:read',
        'users:write',
        'resources:read',
        'resources:write',
        'permissions:read',
        'permissions:write'
      ]
    }])
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Resources', null, {})
  }
}
