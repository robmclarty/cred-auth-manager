#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
const fse = require('fs-extra')

const setupMigrations = argv => {
  fse.copy('./db/migrations', argv._[1])
    .then(() => console.log('migration files copyied'))
    .catch(err => console.log('ERROR: ', err))
}

const setupSeeders = argv => {
  fse.copy('./db/seeders', argv._[1])
    .then(() => console.log('seeder files copyied'))
    .catch(err => console.log('ERROR: ', err))
}

const setupDatabase = argv => {
  fse.copy('./config/database.js', argv._[1])
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
