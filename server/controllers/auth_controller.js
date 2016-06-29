'use strict';

const User = require('../models/user');
const { auth } = require('../auth');

// Create a new user that is guaranteed to not be an admin. This is to be used
// for public-facing signup/registration with the app.
const postRegistration = (req, res, next) => {
  const newUser = req.body;

  // Admin users cannot be created through this endpoint.
  newUser.isAdmin = false;

  User
    .create(newUser)
    .then(user => res.json({
      success: true,
      message: 'Registration successful.',
      user
    }))
    .catch(err => next(err));
};

// This function assumes the request has already been processed by a cred
// authentication function and has attached "tokens" to req.cred according to
// the strategy being used. If that process hit an error or didn't authenticate
// it would have created its own error and not executed this function.
const postTokens = (req, res, next) => {
  if (!req.cred || !req.cred.tokens)
    return next(new Error('Authentication failed.'));

  res.json({
    success: true,
    message: 'Tokens generated successfully.',
    tokens: req.cred.tokens
  });
};

// Takes a refresh-token (in the request header, validated in middleware), and
// returns a fresh access-token.
const putTokens = (req, res, next) => {
  auth.refresh(req.cred.token)
    .then(freshTokens => res.json({
      message: 'Tokens refreshed.',
      tokens: freshTokens
    }))
    .catch(err => next(err));
};

// Logging out is simply done by adding the current, valid, token to a blacklist
// which will invalidate the token until its expiration date has been reached.
// The token is now no longer valid. Respond that the user is now "logged out".
const deleteToken = (req, res, next) => {
  auth.revoke(req.cred.token)
    .then(revokedToken => res.json({
      message: 'Token revoked.',
      token: revokedToken
    }))
    .catch(err => next(err));
};

Object.assign(exports, {
  postRegistration,
  postTokens,
  putTokens,
  deleteToken
});
