'use strict'

const { postRegister } = require('../controllers/user_controller')

const registerRoutes = express => {
  // Use "registration" resource to handle signups. This is separate from creating
  // a "user" resource from the user_controller in that it is public-facing and
  // can be made more limited. It is to be used as part of a signup/registration
  // process which goes hand-in-hand with the above authentication routes.
  // Creating a user from the user_controller can then be reserved for different
  // purposes such as internal administration.
  router.route('/register')
    .post(postRegister)

  return router
}

module.exports = registerRoutes
