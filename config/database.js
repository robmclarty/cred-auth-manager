'use strict'

module.exports = {
  development: {
    url: process.env.DATABASE || 'postgres://localhost:5432/cred-auth-manager',
    dialect: 'postgres',
    seederStorage: 'sequelize'
  },
  test: {
    url: process.env.DATABASE || 'postgres://localhost:5432/cred-auth-manager-test',
    dialect: 'postgres',
    seederStorage: 'sequelize'
  },
  production: {
    url: process.env.DATABASE,
    dialect: 'postgres',
    seederStorage: 'sequelize'
  }
}
