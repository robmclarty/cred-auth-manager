'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const cred = require('./cred')
const config = require('../config/server')

// Express App
// -----------
const app = express()

// Store re-usable values.
app.set('assets-path', config.assetsPath)
app.set('app-name', config.appName)

// Only accept application/json requests.
app.use(bodyParser.json())

// Enable cross-origin resource sharing.
app.use(cors({
  origin: config.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
  //preflightContinue: true
}))

// Pass remote address through proxy so that limiter knows about it.
app.enable("trust proxy")

// Disable X-Powered-By header.
app.disable('x-powered-by')

// Server static assets from /build folder.
// TODO: Make optional so user can serve static files themselves through nginx or apache.
app.use(express.static(`${ __dirname }/../build`))

// Logs
// ----
if (process.env.NODE_ENV === ('development' || 'test')) {
  app.use(morgan('dev'))
}

// Routes
// ------
// Routes are bolted on through custom functions rather than done directly here
// in this file in order to give freedom to users to apply their own custom
// routes and middleware as they see fit. Three functions are provided to split
// the routes into categories of 1. public, unauthenticated, routes/middleware,
// 2. authenticated routes/middleware (all subsequent routes/middleware will
// be required to have a valid auth token), and 3. error handling middleware.

// Unauthenticated routes.
app.loginMiddleware = () => app.use('/', [
  require('./routes/token_routes'),
  //require('./routes/password_reset_routes'),
  require('./routes/public_routes')
])

// All API routes require a valid token and an active user account.
app.authMiddleware = () => app.use('/', [
  cred.requireAccessToken,
  cred.requireProp('isActive', true),
  require('./routes/user_routes'),
  //require('./routes/metadata_routes'),
  require('./routes/resource_routes')
])

// Friendships
app.friendshipMiddleware = () => app.use('/', [
  require('./routes/friendship_routes')
])

// Groups
app.groupMiddleware = () => app.use('/', [
  require('./routes/group_routes'),
  require('./routes/membership_routes')
])

app.standalone = () => {
  app.loginMiddleware()
  app.authMiddleware()
  app.friendshipMiddleware()
  app.groupMiddleware()
}

// Error handlers.
const errorHandler = require('./middleware/error_middleware')

app.errorMiddleware = () => app.use([
  errorHandler.sequelizeError,
  errorHandler.unauthorized,
  errorHandler.forbidden,
  errorHandler.conflict,
  errorHandler.badRequest,
  errorHandler.unprocessable,
  errorHandler.notFound,
  errorHandler.genericError,
  errorHandler.catchall
])

app.errorHelper = require('./helpers/error_helper')

app.cred = cred

module.exports = app
