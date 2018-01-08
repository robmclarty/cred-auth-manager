'use strict'

const express = require('express')
const router = express.Router()
const { requireValidResetToken } = require('../middleware/reset_token_middleware')
const {
  postPasswordReset,
  getPasswordReset,
  putPasswordReset
} = require('../controllers/password_reset_controller')

// Receive an email address that references a user and send that user a link
// to change their password.
//
// GET a form where a new password can be entered for the user associated with the token.
// PUT a new password with temporary token to change it.
router.route('/password-reset')
  .post(postPasswordReset)
  .get(requireValidResetToken, getPasswordReset)
  .put(requireValidResetToken, putPasswordReset)

module.exports = router
