'use strict'

const router = require('express').Router()
const { cred, authorizedRefresh } = require('../auth')
const {
  postTokens,
  putTokens,
  deleteToken
} = require('../controllers/auth_controller')

// Use "token" resource to handle authentication.
// POST = login
// PUT = refresh
// DELETE = logout
router.route('/tokens')
  .post(cred.authenticate('basic'), postTokens)
  .put(authorizedRefresh.requireToken, putTokens)
  .delete(authorizedRefresh.requireToken, deleteToken)

module.exports = router
