
## 1. Install Dependencies

Install cred-auth-manager & sequelize-cli.

You could optionally install sequelize-cli globally using the `-g` flag, in
which case you could execute it directly rather than using `npx` below.

`npm install cred-auth-manager`
`npm install sequelize-cli`


## 2. Copy Migrations & Seeders

Assuming you want to put your migrations and seeders in a folder called `./db`,
the following commands will copy all the necessary migration and seeders files
from inside cred-auth-manager into the folders you specify (remembers these
locations for later):

`npx cred-auth-manager setup:migrations ./db/migrations`
`npx cred-auth-manager setup:seeders ./db/seeders`


## 3. Create `database.js`

Create a file called `database.js` with settings for connecting to your
postgres database (I like creating a folder in the root of my project called
`./config` for holding files such as this):

```javascript
module.exports = {
  url: process.env.DATABASE || 'postgres://localhost:5432/my-database-name',
  dialect: 'postgres',
  seederStorage: 'sequelize'
}
```


## 4. Create `.sequelizerc`

Create a file called `.sequelizerc` in the root of your project with the
following settings. These include pointers to where you created your database
settings file (above), the location of your Sequelize model files (in this case
I've place them in a folder called `./server/models` as well as the locations
of your migrations and seeders.

```javascript
module.exports = {
  'config': './config/database.js',
  'models-path': './server/models',
  'seeders-path': './db/seeders',
  'migrations-path': './db/migrations'
}
```


## 5. Run migrations & seeders

`npx sequelize db:migrate`
`npx sequelize db:seed:all`

...or, if you installed sequelize-cli globally, simply ommit `npx`.


## 6. Create Secrets

cred-auth-manager makes use of different types of tokens for different purposes:

- a) *access tokens* are the work-horse of the system. These are used for any
  and all auth access to the system from the outside. These are the tokens you
  use when you want the system to *do* something. These use 384-bit elliptic
  curve  public key cryptography to harden them against cracking while also
  enabling the sharing of micro-services such that other systems can store a
  public key while having no knowledge of the private key stored on the issuing
  auth system.

- b) *refresh tokens* are used for one single purpose: creating new access
  tokens. Access tokens have a short life-span and die frequently. This secures
  the system by making the token used in regular everyday system requests expire
  automatically in the case that it is potentially intercepted; the attacker
  will not have long to make use of it before it becomes useless. Refresh tokens
  are  used by legitimate users to generate new access tokens as needed. They
  use SHA-512 cryptography with a secret key string stored only on the issuing
  system. An attacker would thus need to have root access to the system itself
  to get at the key (in which case you have bigger problems that access to your
  keys).

- c) *reset tokens* are extremely short-lived one-time-use tokens used as part
  of the password-reset process. They can be emailed to users granting them
  short-term access to perform a reset, but expiring quickly and immediately
  after use. They use SHA-512 like the refresh tokens.

### Create Access Token Keys

You will need OpenSSL to create these keys. You can get a list of what curves
are available on your system using the `openssl ecparam -list_curves` command.
Also see http://safecurves.cr.yp.to/ for comparison of curves and their security.

Generate a private/public key pair:

`openssl ecparam -name secp384r1 -genkey -noout -out ./config/keys/access_private.pem`

Save the public key to its own file (for distribution):

`openssl ec -in ./config/keys/access_private.pem -out ./config/keys/access_public.pem -pubout`

This will create two `.pem` files in `./config/keys` which you can refer to
with your config settings in your app for creating new auth tokens. This value
will be referred to in the config settings for cred-auth-manager.

**NOTE**: Create new keys in production and store their location in your environment
variables referred to by the config settings (don't store your dev keys in the
repo, nor use them in production!)

### Create Refresh Token Secret

I like using the website https://www.grc.com/passwords.htm for creating random
strings for use as secrets in cryptographic systems. You can concatenate multiple
random strings from this site together to form a longer secret if needed. Use
the result for your secret and store it in your env var for refresh secret.

**NOTE**: Do not use the same secret in production!

### Create Reset Token Secret

Same process as for the refresh token, but create a new, different, secret.

**NOTE**: Do not use the same secret in production!


## 7. Create your app

Note that cred-auth-manager returns an Express app so you don't need to include
Express in your own app. But if you would like to use a specific version of
Express other than the one included with cred-auth-manager, you can pass in
you Express instance as a parameter.

Example bare-bones app:

```javascript
const PORT = process.env.PORT || 3000

const express = require('express') // optional
const credAuthManager = require('cred-auth-manager')
const bodyParser = require('body-parser')
const dbConfig = require('../config/database.js')

const app = credAuthManager({
  express, // optional
  issuer: 'phone-disruptor-cloud',
  database: dbConfig.url,
  accessPrivKey: process.env.ACCESS_PRIVATE_KEY || './config/keys/access_private.pem',
  accessPubKey: process.env.ACCESS_PUBLIC_KEY || './config/keys/access_public.pem',
  accessExpiresIn: '24 hours',
  refreshSecret: process.env.REFRESH_SECRET || 'my_super_secret_secret',
  refreshExpiresIn: '7 days',
  resetSecret: process.env.RESET_SECRET || 'my_super_secret_reset_secret'
})

app.use(bodyParser.urlencoded({ extended: true }))

app.loginMiddleware()

// Include any public endpoints here.

app.authMiddleware()

// Include any secured endpoints here (will require access token).

app.errorMiddleware()

app.connect('/absolute/path/to/custom/sequelize/models')
  .then(models => app.listen(PORT))
  .then(server => console.log('Server started on port', PORT))
  .catch(err => console.log('Server ERROR: ', err))
```


## 8. Run it!

`node /path/to/app.js`


## 9. Optionally create shortcut scripts

I like putting all these commands in the `scripts` section of my `package.json`
file for reference because I know I will almost definitely forget what to do
later:

```json
{
  "scripts": {
    "start": "node server/index.js",
    "install:migrations": "npx cred-auth-manager setup:migrations ./db/migrations",
    "install:seeders": "npx cred-auth-manager setup:seeders ./db/seeders",
    "db:migrate": "npx sequelize db:migrate",
    "db:seed": "npx sequelize db:seed:all"
  }
}
```
