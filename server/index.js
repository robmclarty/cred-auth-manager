'use strict'

const express = require('express')
const mongoSanitize = require('express-mongo-sanitize')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const RateLimit = require('express-rate-limit')
const morgan = require('morgan')
const cred = require('./cred')
const config = require('../config/server')

// Express App
// -----------
const app = express()

// Store re-usable values.
app.set('assets-path', './client')

// Only accept application/json requests.
app.use(bodyParser.json())

// Remove object keys containing prohibited characters ($ and .) to prevent DB
// injection attacks.
app.use(mongoSanitize())

// Enable cross-origin resource sharing.
app.use(cors({
  origin: config.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

// Disable X-Powered-By header.
app.disable('x-powered-by')

// Serve static files from /build in development (on the production server,
// this would be handled by a web server/proxy like nginx).
if (process.env.NODE_ENV === ('development' || 'test')) {
  app.use('/', express.static(`${ __dirname }/../build`))
}

// Rate limiter
// ------------
const limiter = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per windowMs
  delayAfter: 0,
  delayMs: 0,
  message: 'Too many requests, please try again later.',
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP ${ req.ip }`)
    res.format({
      html: () => res.status(options.statusCode).end(options.message),
      json: () => res.status(options.statusCode).json({ message: options.message })
    })
  }
})

// Pass remote address through proxy so that limiter knows about it.
app.enable("trust proxy")

// Apply limiter globally.
// Alternatively, we could create different limiters and apply them on specific
// routes like `app.use('/my-route', limiter)`.
app.use(limiter)

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
  cred.requireAccessToken,
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
