'use strict';

const { readFileSync } = require('fs')
const gotCred = require('../../cred/src')
const config = require('../config/server')
const User = require('./models/user')

// Authentication
// --------------
const cred = gotCred({
  //key: 'cred',
  resource: config.appName,
  issuer: config.issuer,
  //cache: config.redis,
  accessOpts: {
    privateKey: readFileSync(config.access.privateKeyPath),
    publicKey: readFileSync(config.access.publicKeyPath),
    expiresIn: config.access.expiresIn,
    algorithm: config.access.algorithm
  },
  refreshOpts: {
    secret: config.refresh.secret,
    expiresIn: config.refresh.expiresIn,
    algorithm: config.refresh.algorithm
  }
})

// Find a user matching 'req.body.username', verify its password, and if it is
// authentic, return a token payload for that user. No need to catch error here
// (just trow them) as they will be handled by cred itself and passed to your
// error handling middleware from there.
cred.use('basic', req => {
  return User.findOne({ username: req.body.username })
    .then(user => Promise.all([user, user.verifyPassword(req.body.password)]))
    .then(userMatch => {
      const user = userMatch[0]
      const isMatch = userMatch[1]

      if (!isMatch) throw 'Unauthorized: username or password do not match.'

      return user
    })
    .then(user => user.tokenPayload())
})

module.exports = cred
