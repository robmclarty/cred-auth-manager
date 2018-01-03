'use strict'

module.exports = opts => {
  const cwd = process.cwd()

  process.env['ISSUER'] = opts.issuer
  process.env['APP_NAME'] = opts.issuer
  process.env['DATABASE'] = opts.database
  process.env['ACCESS_PRIVATE_KEY'] = `${ cwd }/${ opts.accessPrivKey }`
  process.env['ACCESS_PUBLIC_KEY'] = `${ cwd }/${ opts.accessPubKey }`
  process.env['REFRESH_SECRET'] = opts.refreshSecret
  process.env['ASSETS_PATH'] = `${ __dirname }/build`

  const app = require('./server')
  const models = require('./server/models')
  const listen = app.listen

  return {
    use: (path, middleware) => app.use(path, middleware),
    listen: (port, cb) => {
      models.sequelize.sync()
        .then(() => app.listen(port, cb))
        .catch(err => cb(err))
    }
  }
}
