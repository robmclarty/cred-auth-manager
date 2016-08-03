'use strict'

module.exports = {
  development: {
    url: 'postgres://localhost:5432/cred-auth-manager',
    dialect: 'postgres'
  },
  test: {
    url: 'postgres://localhost:5432/cred-auth-manager-test',
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE,
    dialect: 'postgres'
  }
}
