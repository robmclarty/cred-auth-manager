'use strict'

const sequelizeFixtures = require('sequelize-fixtures')

// Run sequelize.sync() to reset the db with all the schemas.
// `models` is defined as a global in env.js
const resetDatabase = () => models.sequelize.sync({ force: true })

before('setup db', () => {
  return resetDatabase()
})

beforeEach('insert fresh models', () => {
  return sequelizeFixtures.loadFiles([
    'tests/server/fixtures/users.json',
    'tests/server/fixtures/resources.json',
    'tests/server/fixtures/permissions.json'
  ], models, { log: msg => {} })
})

afterEach('clean up db', () => {
  return resetDatabase()
})
