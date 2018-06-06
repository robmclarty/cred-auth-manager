'use strict'

const publicRoutes = express => {
  const router = express.Router()

  // Homepage. Loads the index.html file to launch the front-end client UI.
  router.route('/')
    .get((req, res) => res.sendFile('index.html', { root: req.app.get('assets-path') }))

  return router
}

module.exports = publicRoutes
