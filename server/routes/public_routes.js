'use strict'

const router = require('express').Router()
const { postRegistration } = require('../controllers/user_controller')

// Homepage. Loads the index.html file to launch the front-end client UI.
router.route('/')
  .get((req, res) => res.sendFile('index.html', { root: req.app.get('assets-path') }))

// Use "registration" resource to handle signups. This is separate from creating
// a "user" resource from the user_controller in that it is public-facing and
// can be made more limited. It is to be used as part of a signup/registration
// process which goes hand-in-hand with the above authentication routes.
// Creating a user from the user_controller can then be reserved for different
// purposes such as internal administration.
router.route('/registration')
  .post(postRegistration)

// Admin app
// In production this route should really never be hit and should instead be
// handled by nginx.
router.route('/admin/*')
  .get(function (req, res, next) {
    res.sendFile('index.html', { root: `${ req.app.get('assets-path') }/admin` })
  })

module.exports = router
