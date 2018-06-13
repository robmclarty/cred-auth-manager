// Reset password flow:
// POST email => link + reset-token => GET change password form => PUT update user password

'use strict'

const { createToken, revoke } = require('../cred')
const { createError, BAD_REQUEST } = require('../helpers/error_helper')
const emailHelper = require('../helpers/email_helper')
const config = require('../../config/server')

// Requires a valid email to be sent in the request body which is used to match
// a user's account.
// Return "success" regardless of if a matching user was found so that this
// public endpoint cannot be used to confirm if a particular email exists
// in the database or not.
function postPasswordReset(req, res, next) {
  const { User } = req.app.models
  const host = req.get('origin')
  const userEmail = req.body.email

  if (!userEmail) return next(createError({
    status: BAD_REQUEST,
    message: 'Missing email address'
  }))

  User.findOne({
    where: { email: userEmail }
  })
    .then(user => createToken({
      payload: user.tokenPayload(),
      secret: config.jwt.reset.secret,
      issuer: config.jwt.issuer,
      expiresIn: config.jwt.reset.expiresIn,
      algorithm: config.jwt.reset.algorithm,
      subject: config.jwt.reset.subject
    }))
    .then(token => emailHelper.renderTemplate('password_reset', {
      resetUrl: `${ host }/password-reset?token=${ token }`
    }))
    .then(renderedEmail => emailHelper.sendEmail({
      to: userEmail,
      subject: 'Reset password',
      text: renderedEmail.text,
      html: renderedEmail.html
    }))
    .then(() => res.sendStatus(200))
    .catch(err => console.log(err))
    //.catch(err => res.sendStatus(200))
}

// Requires a valid reset-token in the params which is used to find a user
// account and verify their authenticity (token comes from an email link).
//
// TODO: render an HTML page with a form field to enter a new password which
// will submit to the PUT action.
function getPasswordReset(req, res) {
  res.sendStatus(200)
}

// Requires a non-blank password in the request body that will be used to change
// the user account that is associated with the reset-token that is provided.
function putPasswordReset(req, res, next) {
  const { User } = req.app.models

  User.findById(req.resetCred.userId)
    .then(user => {
      if (!user) throw createError({
        message: 'No user found',
        status: BAD_REQUEST
      })

      if (req.body.password) return user.update({
        password: req.body.password
      })

      return user
    })
    .then(user => res.json({
      ok: true,
      message: 'Password updated',
      user
    }))
    .catch(next)
}

module.exports = {
  getPasswordReset,
  postPasswordReset,
  putPasswordReset
}
