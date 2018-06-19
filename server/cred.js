'use strict'

const { readFileSync } = require('fs')
const fetch = require('node-fetch')
const buildUrl = require('build-url')
const base64url = require('base64-url')
const gotCred = require('cred')
const config = require('../config/server')

// Authentication
// --------------
const cred = gotCred({
  resource: config.appName,
  issuer: config.issuer,
  //cache: config.redis,
  accessOpts: {
    privateKey: readFileSync(config.access.privateKeyPath),
    publicKey: readFileSync(config.access.publicKeyPath),
    expiresIn: config.access.expiresIn,
    algorithm: config.access.algorithm
  },
  refreshOpts: {
    secret: config.refresh.secret,
    expiresIn: config.refresh.expiresIn,
    algorithm: config.refresh.algorithm
  }
})

// Find a user matching `req.body.username`, verify its password, and if it is
// authentic, return a token payload for that user. No need to catch error here
// (just trow them) as they will be handled by cred itself and passed to your
// error handling middleware from there (although you can override the default
// error handler by providing your own catch clause if that's what you'd like).
cred.use('basic', req => {
  const username = String(req.body.username)
  const password = String(req.body.password)
  const { User, Permission, Resource } = req.app.models

  return User.findOne({
    where: { username },
    include: [{
      model: Permission,
      include: [Resource]
    }]
  })
    .then(user => {
      if (!user) throw 'Username or password do not match'

      return user
    })
    .then(user => Promise.all([user, user.verifyPassword(password)]))
    .then(userMatch => {
      const user = userMatch[0]
      const isMatch = userMatch[1]

      if (!isMatch) throw 'Username or password do not match'

      return user.loginUpdate()
    })
    .then(user => user.tokenPayload())
    .catch(err => console.log('err: ', err))
})

// Find a user matching `req.body.facebookId`, verify the associated facebook
// access_token with Facebook's API, and if it is authentic, return a token
// payload for that user. If no user is found with this facebookId, create a new
// user with that id.
cred.use('facebook', req => {
  const facebookToken = req.body.facebookToken
  const { User, Permission, Resource } = req.app.models

  if (!facebookToken) throw 'No Facebook access token provided'

  const verifyTokenUrl = buildUrl('https://graph.facebook.com', {
    path: 'debug_token',
    queryParams: {
      input_token: facebookToken,
      access_token: facebookToken
    }
  })

  // Verify that the Facebook access token is valid.
  return fetch(verifyTokenUrl)
    .then(res => {
      if (!res.ok) throw 'Unable to verify Facebook token'

      return res.json()
    })
    .then(json => {
      if (!json.data.is_valid) throw 'Facebook token is not valid'

      const fbProfileUrl = buildUrl('https://graph.facebook.com', {
        path: `v2.8/${ json.data.user_id }`,
        queryParams: {
          access_token: facebookToken,
          fields: 'id,name,email,first_name,last_name'
        }
      })

      // Retrieve user's Facebook profile.
      return fetch(fbProfileUrl)
    })
    .then(res => {
      if (!res.ok) throw 'Unable to retrieve Facebook profile'

      return res.json()
    })
    .then(fbProfile => {
      // Try to find existing user with this Facebook id.
      return Promise.all([
        fbProfile,
        User.findOne({
          where: { facebookId: fbProfile.id },
          include: [{
            model: Permission,
            include: [Resource]
          }]
        })
      ])
    })
    .then(results => {
      const fbProfile = results[0]
      const user = results[1]

      // If no user found with facebookId, create a new one.
      if (!user) {
        // TODO: There is currently no guarantee that the automatically created
        // username from the facebook profile will be unique in this system.
        // Check for uniqueness first, and then append numbers to the end until
        // it is unique. Don't want to use the email as the username so that
        // users' emails aren't passed around the internet inside their tokens.
        return Promise.all([
          fbProfile,
          User.create({
            username: base64url.escape(fbProfile.name.replace(/ /g, '')).toLowerCase(),
            email: fbProfile.email,
            facebookId: fbProfile.id,
            isAdmin: false,
            isActive: true
          })
        ])
      }

      // Otherwise, use the user that was found and update his/her loginAt
      return Promise.all([null, user.loginUpdate()])
    })
    .then(results => {
      const fbProfile = results[0]
      const user = results[1]
      const payload = user.tokenPayload()

      // If this is a new user that was just created and passed a fbProfile here
      // then attach a normalized profile to the cred object to be returned
      // along side the tokens in the response to the client.
      if (fbProfile) req.credProfile = {
        userId: user.id,
        firstName: fbProfile.first_name,
        lastName: fbProfile.last_name,
        name: fbProfile.name
      }

      return payload
    })
})

module.exports = cred
