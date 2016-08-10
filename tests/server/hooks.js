'use strict'

const sequelize = require('sequelize')

// TODO: finish setting up db for testing
beforeEach('insert fresh models', () => {
  sequelize.sync({ force: true })
});

afterEach('clean up db', done => {

  return done()
})
