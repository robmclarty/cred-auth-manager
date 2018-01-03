# Cred Auth Manager

![screenshot](screenshot.png)

A centralized auth management system for handling user accounts and setting
their permissions to be used across multiple independent resource APIs by
exchanging JSON Web Tokens for valid cred(entials).

This is a demonstration and a starting point for making your own auth app for
managing your users. It includes a UI (React SPA), a simple build pipeline using
Gulp 4, and a deployment process using Gulp with rsync and ssh.

The server itself has no front-end. It is a simple JSON API. But the React app
accesses its interface and enables a UI for changing settings. Your
customer-facing apps can access the API in the same way this React app does
using the JSON API to login, get tokens, and manage settings.

## Install

`npm install cred-auth-manager`

## Usage

### NPM Module

```javascript
const credAuthManager = require('cred-auth-manager')

const app = credAuthManager({
  issuer: 'my-app-name',
  database: 'postgres://localhost:5432/my-db-name',
  accessPrivKey: '/path/to/private/key',
  accessPubKey: '/path/to/public/key',
  refreshSecret: 'my_super_secret_secret'
})

app.use('/custom/path', (req, res, next) => {
  res.json({
    ok: true,
    message: 'It worked!'
  })
})

app.listen(3000, err => {
  if (err) return console.log('ERROR: ', err)

  console.log('Server started on port 3000')
})
```

### Docker Container

...coming soon

## License

MIT

## Acknowledgements

[Cred](https://github.com/robmclarty/cred)
