'use strict'

const cred = require('../cred')
const {
  postTokens,
  putTokens,
  deleteToken
} = require('../controllers/token_controller')

const tokenRoutes = express => {
  const router = express.Router()

  // Same as POST /tokens except using facebookId + facebookToken instead.
  router.route('/tokens/facebook')
    .post(cred.authenticate('facebook'), postTokens)

  // Use "tokens" resource to handle authentication.
  // POST = login
  // PUT = refresh
  // DELETE = logout
  router.route('/tokens')
    .post(cred.authenticate('basic'), postTokens)
    .put(cred.requireRefreshToken, putTokens)
    .delete(cred.requireRefreshToken, deleteToken)

  return router
}

module.exports = tokenRoutes
