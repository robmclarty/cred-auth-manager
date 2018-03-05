'use strict'

const fs = require('fs')

const modulePath = '../../node_modules/cred-auth-manager/server/models'
const localPath = '../../server/models'
const modelsPath = fs.existsSync(modulePath) ? modulePath : localPath

const { User } = require(modelsPath)

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
