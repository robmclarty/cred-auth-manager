'use strict'

const router = require('express').Router()
const cred = require('../cred')
const {
  postTokens,
  putTokens,
  deleteToken
} = require('../controllers/token_controller')

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

module.exports = router
