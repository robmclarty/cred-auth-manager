'use strict'

const cwd = process.cwd()

module.exports = opts => {
  process.env['ISSUER'] = opts.issuer
  process.env['APP_NAME'] = opts.issuer
  process.env['DATABASE'] = opts.database
  process.env['ACCESS_PRIVATE_KEY'] = `${ cwd }/${ opts.accessPrivKey }`
  process.env['ACCESS_PUBLIC_KEY'] = `${ cwd }/${ opts.accessPubKey }`
  process.env['REFRESH_SECRET'] = opts.refreshSecret
  process.env['ASSETS_PATH'] = `${ __dirname }/build`

  if (opts.accessExpiresIn) process.env['ACCESS_EXPIRES_IN'] = opts.accessExpiresIn
  if (opts.refreshExpiresIn) process.env['REFRESH_EXPIRES_IN'] = opts.refreshExpiresIn
  if (opts.resetSecret) process.env['RESET_SECRET'] = opts.resetSecret

  const app = require('./server')
  const models = require('./server/models')

  // Override Express `listen` function in order to load the Sequelize models
  // when Express server is started, but return express listen once done.
  app.init = (port, cb) => models.sequelize.sync()
    .then(() => app.listen(port, cb))
    .catch(err => cb(err))

  return app
}
