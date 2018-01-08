'use strict'

const { verify, tokenFromReq } = require('../cred')
const { createError, UNAUTHORIZED } = require('../helpers/error_helper')
const config = require('../../config/server')

const requireValidResetToken = (req, res, next) => {
  const token = tokenFromReq(req)

  if (!token) return next(createError({
    status: UNAUTHORIZED,
    message: 'No token provided or missing authorization header'
  }))

  verify(token, config.jwt.reset.secret, {
    issuer: config.jwt.issuer,
    subject: config.jwt.reset.subject
  })
    .then(payload => {
      req.resetCred = payload

      return next()
    })
    .catch(err => next(createError({
      status: UNAUTHORIZED,
      message: err.message,
      error: err
    })))
}

module.exports = {
  requireValidResetToken
}
