'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const cred = require('cred');
const config = require('../config/server');

const app = express();

app.set('name', config.appName);
app.set('issuer', config.issuer);

// Authentication
const auth = cred({
  issuer: app.get('issuer'),
  cache: config.redis,
  accessToken: {
    key: readFileSync(config.accessToken.privateKeyPath),
    exp: config.accessToken.expiresIn,
    alg: config.accessToken.algorithm
  },
  refreshToken: {
    key: config.refreshToken.secret,
    exp: config.refreshToken.expiresIn,
    alg: config.refreshToken.algorithm
  }
});

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
const authorizedRefresh = cred.authorize({
  issuer: app.get('issuer'),
  key: config.refreshToken.secret,
  alg: config.refresh.algorithm
});
const authorizedAccess = cred.authorize({
  name: app.get('name'),
  issuer: app.get('issuer'),
  key: readFileSync(config.accessToken.publicKeyPath),
  alg: config.accessToken.algorithm
});

// Logs
if (process.env.NODE_ENV === ('development' || 'test')) {
  app.use(morgan('dev'));
}

// Database
mongoose.connect(config.database);
mongoose.connection.on('connected', () => console.log('Connected to Mongo.'));
mongoose.connection.on('error', err => console.log('Database Error: ', err));
mongoose.connection.on('disconnected', () => console.log('Disconnected from Mongo.'));

// Accept application/json
app.use(bodyParser.json());

// Serve static files from /build in development (on the production server,
// this would be handled by a web server/proxy like nginx).
if (process.env.NODE_ENV === ('development' || 'test')) {
  app.use('/', express.static(`${ __dirname }/../build`));
}

// Routing
const authRoutes = require('./routes/auth_routes');
const publicRoutes = require('./routes/public_routes');
const userRoutes = require('./routes/user_routes');
const resourceRoutes = require('./routes/resource_routes');

// Unauthenticated routes
app.use('/', [
  authRoutes,
  publicRoutes
]);

// All API routes require a valid token.
app.use('/', [
  cred.requireAccessToken,
  userRoutes,
  resourceRoutes
]);

// Error handlers.
const {
  unauthorized,
  forbidden,
  badRequest,
  unprocessable,
  genericError,
  pageNotFound
} = require('./middleware/error_middleware');

app.use([
  unauthorized,
  forbidden,
  badRequest,
  unprocessable,
  genericError,
  pageNotFound
]);

module.exports = app;
