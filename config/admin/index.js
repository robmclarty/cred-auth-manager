'use strict'

const isProduction = process.env.NODE_ENV === 'production'
const settings = isProduction ?
  require('./settings.json') :
  require('./settings.sample.json')

const stuff = {
  appName: process.env.APP_NAME || isProduction ? settings.appName : "cred-auth-manager",
  authRoot: process.env.AUTH_ROOT || isProduction ? settings.authRoot : "http://localhost:3000"
}

console.log('stuff: ', stuff)

module.exports = stuff
