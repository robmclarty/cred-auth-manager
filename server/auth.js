'use strict';

const { readFileSync } = require('fs')
const gotCred = require('../../cred/dist')
const config = require('../config/server')
const User = require('./models/user')

// Authentication
// --------------
const cred = gotCred.authentication({
  key: 'cred',
  issuer: config.issuer,
  cache: config.redis,
  accessOpts: {
    secret: readFileSync(config.access.privateKeyPath),
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

// Authorization
// -------------
const authorizedRefresh = gotCred.authorization({
  key: 'cred',
  issuer: config.issuer,
  secret: config.refresh.secret,
  algorithm: config.refresh.algorithm
})

const authorizedAccess = gotCred.authorization({
  name: config.appName,
  key: 'cred',
  issuer: config.issuer,
  secret: readFileSync(config.access.publicKeyPath),
  algorithm: config.access.algorithm
})

Object.assign(exports, {
  cred,
  authorizedRefresh,
  authorizedAccess
})
