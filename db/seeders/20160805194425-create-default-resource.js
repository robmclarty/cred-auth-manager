'use strict'

const fs = require('fs')

const modulePath = '../../node_modules/cred-auth-manager/server/models'
const localPath = '../../server/models'
const modelsPath = fs.existsSync(modulePath) ? modulePath : localPath

const { Resource } = require(modelsPath)

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Resource.create({
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
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Resources', null, {})
  }
}
