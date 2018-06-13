'use strict'

const modelsPath = `${ __dirname }/../../node_modules/cred-auth-manager/server/models`
const { User } = require(modelsPath)

module.exports = {
  up: function (queryInterface, Sequelize) {
    return User.hashPassword('password')
      .then(hashedPassword => queryInterface.bulkInsert('Users', [{
        id: 1,
        username: 'admin',
        password: hashedPassword,
        email: 'admin@email.com',
        phone: '+1234445556666',
        isActive: true,
        isAdmin: true
      }]))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
