'use strict'

const env = process.env.NODE_ENV || 'development'

const config = {
  development: require('./development.json'),
  production: require('./production.json'),
  staging: require('./staging.json')
}

module.exports = config[env]
