'use strict';

const gotCred = require('cred');
const config = require('../config/server');
const User = require('./models/user');

// Authentication
const auth = gotCred.authentication({
  key: 'cred',
  issuer: config.issuer,
  cache: config.redis,
  accessToken: {
    secret: readFileSync(config.accessToken.privateKeyPath),
    expiresIn: config.accessToken.expiresIn,
    algorithm: config.accessToken.algorithm
  },
  refreshToken: {
    secret: config.refreshToken.secret,
    expiresIn: config.refreshToken.expiresIn,
    algorithm: config.refreshToken.algorithm
  }
});

// Find a user matching 'req.body.username', verify its password, and if it is
// authentic, return a token payload for that user. No need to catch error here
// (just trow them) as they will be handled by cred itself and passed to your
// error handling middleware from there.
auth.use('basic', req => {
  return User.findOne({ username: req.body.username })
    .then(user => Promise.all([user, user.verifyPassword(req.body.password)]))
    .then(userMatch => {
      const user = userMatch[0];
      const isMatch = userMatch[1];

      if (!isMatch) throw 'Unauthorized: username or password do not match.';

      return user;
    })
    .then(user => user.tokenPayload());
});

// Authorization
const authorizedRefresh = gotCred.authorization({
  key: 'cred',
  issuer: config.issuer,
  secret: config.refreshToken.secret,
  algorithm: config.refresh.algorithm
});

const authorizedAccess = gotCred.authorization({
  name: config.appName,
  key: 'cred',
  issuer: config.issuer,
  secret: readFileSync(config.accessToken.publicKeyPath),
  algorithm: config.accessToken.algorithm
});

Object.assign(exports, {
  auth,
  authorizedRefresh,
  authorizedAccess
});
