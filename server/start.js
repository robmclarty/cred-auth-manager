#!/usr/bin/env node

'use strict'

const createApp = require('../server')
const app = createApp() // Create app with built-in Express module.
const models = require('./models')

app.set('port', process.env.PORT || 3000)

// Connect to DB and start the server.
models.sequelize.sync()
  .then(() => {
    const server = app.listen(app.get('port'), () => {
      console.log(`Server started at port ${ server.address().port }`)
    })
  })
  .catch(err => console.log('DB Error: ', err))
