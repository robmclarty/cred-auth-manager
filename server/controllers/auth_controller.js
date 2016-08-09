'use strict'

const { createError, UNAUTHORIZED } = require('../helpers/error_helper')
//const cred = require('../cred')

// This function assumes the request has already been processed by a cred
// authentication function and has attached "tokens" to req.cred according to
// the strategy being used. If that process hit an error or didn't authenticate
// it would have created its own error and not executed this function.
// POST /tokens
const postTokens = (req, res, next) => {
  // if (!req.cred || !req.cred.tokens) return next(createError({
  //   status: UNAUTHORIZED,
  //   message: 'Authentication failed.'
  // }))
  //
  // res.json({
  //   success: true,
  //   message: 'Tokens generated successfully.',
  //   tokens: req.cred.tokens
  // })
}

// Takes a refresh-token (in the request header, validated in middleware), and
// returns a fresh access-token.
// PUT /tokens
const putTokens = (req, res, next) => {
  // cred.refresh(req.cred.token)
  //   .then(freshTokens => res.json({
  //     message: 'Tokens refreshed.',
  //     tokens: freshTokens
  //   }))
  //   .catch(err => next(createError({
  //     status: UNAUTHORIZED,
  //     message: err
  //   })))
}

// Logging out is simply done by removing the current, valid, token from a
// whitelist which will invalidate the token. Respond that the user is now
// "logged out".
// DELETE /tokens
const deleteToken = (req, res, next) => {
  // cred.revoke(req.cred.token)
  //   .then(revokedToken => res.json({
  //     message: 'Token revoked.',
  //     token: revokedToken
  //   }))
  //   .catch(err => next(createError({
  //     status: UNAUTHORIZED,
  //     message: err
  //   })))
}

Object.assign(exports, {
  postTokens,
  putTokens,
  deleteToken
})
