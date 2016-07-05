'use strict'

const gulp = require('gulp')
const mongoose = require('mongoose')
const User = require('../server/models/user')
const Resource = require('../server/models/resource')
const config = require('../config/server')

mongoose.Promise = global.Promise

gulp.task('list-users', function (done) {
  const argv = require('yargs').argv

  mongoose.connect(config.database)

  User.find({})
    .then(users => {
      users.forEach(user => {
        console.log(`id: ${ user.id }, username: ${ user.username }`)
      })
      process.exit()
    })
    .catch(err => {
      console.log('Error: ', err)
      process.exit(1)
    })

  done()
})

// gulp create-user --username admin --password password --email me@blah.com --admin true
gulp.task('create-user', function (done) {
  const argv = require('yargs').argv

  const user = new User({
    username: argv.username,
    password: argv.password,
    email: argv.email,
    isAdmin: argv.admin
  })

  mongoose.connect(config.database)

  user.save()
    .then(user => {
      console.log(`User ${ argv.username } created.`)
      process.exit()
    })
    .catch(err => {
      console.log('Error: ', err)
      process.exit(1)
    })

  done()
})

// gulp create-resource --name cred-auth-manager --url http://localhost:3000 --actions admin --actions another-action
gulp.task('create-resource', function (done) {
  const argv = require('yargs')
    .array('actions')
    .string('name')
    .string('url')
    .argv

  const resource = new Resource({
    name: argv.name,
    url: argv.url,
    actions: argv.actions
  })

  mongoose.connect(config.database)

  resource.save()
    .then(resource => console.log(`Resource ${ argv.name } created.`))
    .then(() => process.exit())
    .catch(err => {
      console.log('Error: ', err)
      process.exit(1)
    })

  done()
})

// gulp add-permissions --username admin --resource cred-auth-manager --actions admin --actions another-action
gulp.task('add-permissions', function (done) {
  const argv = require('yargs')
    .usage('Usage: gulp add-permissions [options]')
    .example('gulp add-permissions --username admin --resource cred-auth-manager --actions admin users:read some-other-action')
    .alias('u', 'username')
    .alias('r', 'resource')
    .alias('a', 'actions')
    .array('actions')
    .string('username')
    .string('resource')
    .argv

  mongoose.connect(config.database)

  User.findOne({ username: argv.username })
    .then(user => {
      if (!user) throw 'No user found with that username.'
      return user
    })
    .then(user => Promise.all([user, Resource.findOne({ name: argv.resource })]))
    .then(userAndResource => {
      const user = userAndResource[0];
      const resource = userAndResource[1];

      if (!resource) throw 'No resource found with that name.'
      if (!argv.actions || !Array.isArray(argv.actions)) throw 'No actions provided, or not valid input.'

      user.addPermission({
        resource,
        actions: argv.actions
      })

      return user.save()
    })
    .then(user => console.log('Permissions added successfully.'))
    .then(() => process.exit())
    .catch(err => {
      console.log('Error: ', err)
      process.exit(1)
    })

  done()
})
