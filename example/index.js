'use strict'

const credAuthManager = require('../index.js')

const port = 3000

const app = credAuthManager({
  issuer: 'cred-auth-manager-example',
  database: 'postgres://localhost:5432/cred-auth-manager',
  accessPrivKey: './config/keys/private-key.pem.sample',
  accessPubKey: './config/keys/public-key.pem.sample',
  refreshSecret: 'my_super_secret_secret',
  resetSecret: 'my_other_super_secret_secret'
})

app.loginMiddleware()

app.use('/custom-public', (req, res, next) => {
  res.json({
    ok: true,
    message: 'Custom public route is working.'
  })
})

app.authMiddleware()
app.friendshipMiddleware()
app.groupMiddleware()

app.use('/custom-authenticated', (req, res, next) => {
  res.json({
    ok: true,
    message: 'Custom authenticated route is working.'
  })
})

app.errorMiddleware()

app.init(port, err => {
  if (err) return console.log('ERROR: ', err)

  console.log('server started on port', port)
})
