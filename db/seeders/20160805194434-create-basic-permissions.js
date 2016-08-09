'use strict';

const {
  User,
  Resource,
  Permission
} = require('../../server/models')

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      User.findOne({ where: { username: 'admin' } }),
      Resource.findOne({ where: { name: 'cred-auth-manager' } })
    ])
      .then(userAndResource => {
        const user = userAndResource[0]
        const resource = userAndResource[1]

        return Permission.create({
          userId: user.id,
          resourceId: resource.id,
          actions: [
            'users:read',
            'users:write',
            'resources:read',
            'resources:write',
            'permissions:read',
            'permissions:write'
          ]
        })
      })
      .catch(err => console.log('Seed error: ', err))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Permissions', null, {})
  }
}
