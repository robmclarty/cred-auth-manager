'use strict'

const buildModels = require('./model_builder')
const cwd = process.cwd()

module.exports = opts => {
  const dialect = opts.dialect || 'postgres'

  process.env['ISSUER'] = opts.issuer
  process.env['APP_NAME'] = opts.issuer
  process.env['DATABASE'] = opts.database
  process.env['DIALECT'] = dialect
  process.env['ACCESS_PRIVATE_KEY'] = `${ cwd }/${ opts.accessPrivKey }`
  process.env['ACCESS_PUBLIC_KEY'] = `${ cwd }/${ opts.accessPubKey }`
  process.env['REFRESH_SECRET'] = opts.refreshSecret
  process.env['ASSETS_PATH'] = `${ __dirname }/build`

  if (opts.accessExpiresIn) process.env['ACCESS_EXPIRES_IN'] = opts.accessExpiresIn
  if (opts.refreshExpiresIn) process.env['REFRESH_EXPIRES_IN'] = opts.refreshExpiresIn
  if (opts.resetSecret) process.env['RESET_SECRET'] = opts.resetSecret

  const app = require('./server')

  app.connect = dir => buildModels(dir, opts.database, dialect)
    .then(models => models.sequelize.sync())

  return app
}
