'use strict'

module.exports = {
  appName: process.env.APP_NAME || 'cred-auth-manager',
  issuer: process.env.ISSUER || 'cred-auth-manager',
  origin: process.env.ORIGIN || '*',
  redis: process.env.REDIS || 'redis://localhost:6379',
  access: {
    privateKeyPath: process.env.ACCESS_PRIVATE_KEY || './config/sample-private-key.pem',
    publicKeyPath: process.env.ACCESS_PUBLIC_KEY || './config/sample-public-key.pem',
    expiresIn: process.env.ACCESS_EXPIRES_IN || '24 hours',
    algorithm: process.env.ACCESS_ALG || 'ES384' // ECDSA using P-384 curve and SHA-384 hash algorithm
  },
  refresh: {
    secret: process.env.REFRESH_SECRET || 'my_super_secret_secret',
    expiresIn: process.env.REFRESH_EXPIRES_IN || '7 days',
    algorithm: process.env.REFRESH_ALG || 'HS512' // HMAC using SHA-512 hash algorithm
  }
}
