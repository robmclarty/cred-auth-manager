'use strict'

const { createError, UNAUTHORIZED } = require('../helpers/error_helper')
const cred = require('../cred')

// POST /tokens
// This function assumes the request has already been processed by a cred
// authentication function and has attached "tokens" to req.cred according to
// the strategy being used. If that process hit an error or didn't authenticate
// it would have created its own error and not executed this function.
const postTokens = (req, res, next) => {
  if (!req.cred || !req.cred.tokens) return next(createError({
    status: UNAUTHORIZED,
    message: 'Authentication failed'
  }))

  const data = { tokens: req.cred.tokens }

  // If a profile was attached to the cred object, include it in the data that
  // is returned to the client.
  if (req.credProfile) data.profile = req.credProfile

  res.json(Object.assign({
    success: true,
    message: 'Tokens generated successfully',
  }, data))
}

// PUT /tokens
// Takes a refresh-token (in the request header, validated in middleware), and
// returns a fresh access-token.
const putTokens = (req, res, next) => {
  cred.refresh(req.cred.token)
    .then(freshTokens => res.json({
      success: true,
      message: 'Tokens refreshed',
      tokens: freshTokens
    }))
    .catch(err => next(createError({
      success: false,
      status: UNAUTHORIZED,
      message: err
    })))
}

// DELETE /tokens
// Logging out is simply done by removing the current, valid, token from a
// whitelist which will invalidate the token. Respond that the user is now
// "logged out".
const deleteToken = (req, res, next) => {
  let token = req.cred.token

  // Don't allow non-admin users to revoke other users' tokens.
  if (req.body.token && !req.cred.payload.isAdmin) return next(createError({
    success: false,
    status: FORBIDDEN,
    message: 'You are not authorized to revoke this token.'
  }))

  // If a token was provided in the body, delete that token instead of the one
  // that was used to authorize the request (this allows users to delete other
  // user's tokens).
  if (req.body.token && req.cred.payload.isAdmin) token = req.body.token

  cred.revoke(token)
    .then(revokedToken => res.json({
      success: true,
      message: 'Token revoked',
      token: revokedToken
    }))
    .catch(err => next(createError({
      success: false,
      status: UNAUTHORIZED,
      message: err
    })))
}

module.exports = {
  postTokens,
  putTokens,
  deleteToken
}
