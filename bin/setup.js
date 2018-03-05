#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
const fse = require('fs-extra')

// `npx cred-auth-manager setup:mirations ./destination/path`
const setupMigrations = argv => {
  const migrationsFolder = `${ __dirname }/../db/migrations`

  fse.copy(migrationsFolder, argv._[1])
    .then(() => console.log('migration files copyied'))
    .catch(err => console.log('ERROR: ', err))
}

// `npx cred-auth-manager setup:seeders ./destination/path`
const setupSeeders = argv => {
  const seedersFolder = `${ __dirname }/../db/seeders`

  fse.copy(seedersFolder, argv._[1])
    .then(() => console.log('seeder files copyied'))
    .catch(err => console.log('ERROR: ', err))
}

// `npx cred-auth-manager setup:database ./destination/path`
const setupDatabase = argv => {
  const databaseConfig = `${ __dirname }/../config/database.js`

  fse.copy(databaseConfig, argv._[1])
    .then(() => console.log('database config copyied'))
    .catch(err => console.log('ERROR: ', err))
}

const tasks = {
  'setup:migrations': setupMigrations,
  'setup:seeders': setupSeeders,
  'setup:database': setupDatabase
}

const action = argv._[0]

tasks[action](argv)
