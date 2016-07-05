'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const fs = require('fs')
const { authorizedAccess } = require('./auth')
const config = require('../config/server')

// Express App
// -----------
const app = express()

app.set('assets-path', './client')

// Accept application/json
app.use(bodyParser.json())

// Serve static files from /build in development (on the production server,
// this would be handled by a web server/proxy like nginx).
if (process.env.NODE_ENV === ('development' || 'test')) {
  app.use('/', express.static(`${ __dirname }/../build`))
}

// Logs
// ----
if (process.env.NODE_ENV === ('development' || 'test')) {
  app.use(morgan('dev'))
}

// Database
// --------
mongoose.Promise = global.Promise
mongoose.connect(config.database)
mongoose.connection.on('connected', () => console.log('Connected to Mongo.'))
mongoose.connection.on('error', err => console.log('Database Error: ', err))
mongoose.connection.on('disconnected', () => console.log('Disconnected from Mongo.'))

// Routes
// ------
const authRoutes = require('./routes/auth_routes')
const publicRoutes = require('./routes/public_routes')
const userRoutes = require('./routes/user_routes')
const resourceRoutes = require('./routes/resource_routes')

// Unauthenticated routes
app.use('/', [
  authRoutes,
  publicRoutes
])

// All API routes require a valid token.
app.use('/', [
  authorizedAccess.requireToken,
  userRoutes,
  resourceRoutes
])

// Error handlers
// --------------
const errorHandlers = require('./middleware/error_middleware')

app.use([
  errorHandlers.unauthorized,
  errorHandlers.forbidden,
  errorHandlers.badRequest,
  errorHandlers.unprocessable,
  errorHandlers.genericError,
  errorHandlers.pageNotFound
])

module.exports = app
