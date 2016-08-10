'use strict'

// Run sequelize.sync() to reset the db with all the schemas.
// `models` is defined as a global in env.js
const resetDatabase = () => models.sequelize.sync({ force: true })

before('setup db', done => {
  resetDatabase()
  return done()
})

// TODO: finish setting up db for testing
// beforeEach('insert fresh models', () => {
//
// })

afterEach('clean up db', done => {
  resetDatabase()
  return done()
})
