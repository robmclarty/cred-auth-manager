'use strict'

const { requireValidResetToken } = require('../middleware/reset_token_middleware')
const {
  postPasswordReset,
  getPasswordReset,
  putPasswordReset
} = require('../controllers/password_reset_controller')

const passwordResetRoutes = express => {
  const router = express.Router()

  // Receive an email address that references a user and send that user a link
  // to change their password.
  //
  // GET a form where a new password can be entered for the user associated with the token.
  // PUT a new password with temporary token to change it.
  router.route('/password-reset')
    .post(postPasswordReset)
    .get(requireValidResetToken, getPasswordReset)
    .put(requireValidResetToken, putPasswordReset)

  return router
}

module.exports = passwordResetRoutes
