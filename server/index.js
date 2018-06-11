'use strict'

const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const cred = require('./cred')
const config = require('../config/server')

// Express App
// -----------
const createApp = (customExpress, useStatic = false) => {
  // If an express reference was passed as a parameter, use that, otherwise use
  // the built-in express defined in cred-auth-manager's package.json.
  const express = customExpress ? customExpress : require('express')

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
  if (useStatic) app.use(express.static(`${ __dirname }/../build`))

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

  app.publicMiddleware = () => app.use('/', [
    require('./routes/public_routes')(express)
  ])

  // Unauthenticated routes.
  app.loginMiddleware = () => app.use('/', [
    require('./routes/token_routes')(express),
    //require('./routes/password_reset_routes')(express)
  ])

  app.registerMiddleware = () => app.use('/', [
    require('./routes/register_routes')(express)
  ])

  app.adminMiddleware = () => app.use('/', [
    require('./routes/admin_routes')(express)
  ])

  // All API routes require a valid token and an active user account.
  app.authMiddleware = () => app.use('/', [
    cred.requireAccessToken,
    cred.requireProp('isActive', true),
    require('./routes/user_routes')(express),
    //require('./routes/metadata_routes')(express),
    require('./routes/resource_routes')(express)
  ])

  // Friendships
  app.friendshipMiddleware = () => app.use('/', [
    require('./routes/friendship_routes')(express)
  ])

  // Groups
  app.groupMiddleware = () => app.use('/', [
    require('./routes/group_routes')(express),
    require('./routes/membership_routes')(express)
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

  app.requireRefreshToken = cred.requireRefreshToken

  return app
}

module.exports = createApp
