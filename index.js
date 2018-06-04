'use strict'

// Take an array of sequelize model files and load/init them with sequelize and
// return an object containing each model as an attribute.
// const loadModels = files => {
//   const path = require('path')
//   const Sequelize = require('sequelize')
//   const env = process.env.NODE_ENV || 'development'
//   const config = require('./config/database')
//   const sequelize = new Sequelize(config[env].url, {
//     dialect: config[env].dialect,
//     logging: false
//   })
//   const models = {}
//
//   files.forEach(file => {
//     console.log('file: ', file)
//     const model = sequelize.import(file)
//
//     models[model.name] = model
//     console.log('Loaded model ', model.name)
//   })
//
//   Object.keys(models).forEach(modelName => {
//     if ('associate' in models[modelName]) models[modelName].associate(models)
//   })
//
//   models.sequelize = sequelize
//   models.Sequelize = Sequelize
//
//   return models
// }

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
  //const coreModels = require('./server/models')

  // TODO: attach models/db-config to app instance for use outside module
  // app.connect = models => {
  //   return models.sequelize.sync()
  //     .then(() => models)
  // }

  app.connect = dir => buildModels(dir, opts.database, dialect)
    .then(models => models.sequelize.sync())

  return app
}
