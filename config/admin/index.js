'use strict'

const settings = require('./settings.json')
const isProduction = process.env.NODE_ENV === 'production'

const stuff = {
  appName: process.env.APP_NAME || isProduction ? settings.appName : "cred-auth-manager",
  authRoot: process.env.AUTH_ROOT || isProduction ? settings.authRoot : "http://localhost"
}

console.log('stuff: ', stuff)

module.exports = stuff
