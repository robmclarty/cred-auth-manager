'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Permissions', [{
      userId: 1,
      resourceId: 1,
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
    return queryInterface.bulkDelete('Permissions', null, {})
  }
}
