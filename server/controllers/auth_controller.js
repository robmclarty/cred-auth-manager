'use strict'

const { createError, UNAUTHORIZED } = require('../helpers/error_helper')
const User = require('../models/user')
const { cred } = require('../auth')

// This function assumes the request has already been processed by a cred
// authentication function and has attached "tokens" to req.cred according to
// the strategy being used. If that process hit an error or didn't authenticate
// it would have created its own error and not executed this function.
const postTokens = (req, res, next) => {
  if (!req.cred || !req.cred.tokens)
    return next(new Error('Authentication failed.'))

  res.json({
    success: true,
    message: 'Tokens generated successfully.',
    tokens: req.cred.tokens
  })
}

// Takes a refresh-token (in the request header, validated in middleware), and
// returns a fresh access-token.
const putTokens = (req, res, next) => {
  auth.refresh(req.cred.token)
    .then(freshTokens => res.json({
      message: 'Tokens refreshed.',
      tokens: freshTokens
    }))
    .catch(next)
}

// Logging out is simply done by adding the current, valid, token to a blacklist
// which will invalidate the token until its expiration date has been reached.
// The token is now no longer valid. Respond that the user is now "logged out".
const deleteToken = (req, res, next) => {
  auth.revoke(req.cred.token)
    .then(revokedToken => res.json({
      message: 'Token revoked.',
      token: revokedToken
    }))
    .catch(next)
}

Object.assign(exports, {
  postTokens,
  putTokens,
  deleteToken
})
