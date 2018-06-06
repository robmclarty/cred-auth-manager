'use strict'

const adminRoutes = express => {
  const router = express.Router()

  // Admin app
  // In production this route should really never be hit and should instead be
  // handled by nginx.
  router.route('/admin/*')
    .get(function (req, res, next) {
      res.sendFile('index.html', { root: `${ req.app.get('assets-path') }/admin` })
    })

  return router
}

module.exports = adminRoutes
