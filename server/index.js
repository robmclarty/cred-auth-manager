'use strict'

const express = require('express')
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

// Serve static files from /build in development (on the production server,
// this would be handled by a web server/proxy, like nginx).
// if (process.env.NODE_ENV === ('development' || 'test')) {
//   app.use('/', express.static(`${ __dirname }/../build`))
// }

app.use(express.static(`${ __dirname }/../build`))

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

// Apply limiter globally.
// Alternatively, we could create different limiters and apply them on specific
// routes like `app.use('/my-route', limiter)`.
app.use(limiter)

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
const tokenRoutes = require('./routes/token_routes')
const publicRoutes = require('./routes/public_routes')
const userRoutes = require('./routes/user_routes')
const resourceRoutes = require('./routes/resource_routes')
const errorHandler = require('./middleware/error_middleware')

// Unauthenticated routes.
app.loginMiddleware = () => app.use('/', [
  tokenRoutes,
  publicRoutes
])

// All API routes require a valid token and an active user account.
app.authMiddleware = () => app.use('/', [
  cred.requireAccessToken,
  cred.requireProp('isActive', true),
  userRoutes,
  resourceRoutes
])

// Error handlers.
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

module.exports = app
