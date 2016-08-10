'use strict'

const configPath = '../../config'
const serverPath = '../../server'

// Vars
process.env.NODE_ENV = 'test'
process.env.DATABASE = require(`${ configPath }/database`).test

// Utils
global.chai = require('chai')
global.expect = chai.expect
global.supertest = require('supertest-as-promised')(Promise)
global.cred = require(`${ serverPath }/cred`)
global.config = require(`${ configPath }/server`)
global.errorCodes = require(`${ serverPath }/helpers/error_helper`)
global.app = require(serverPath)
global.request = supertest.agent(app)

// Models
global.models = require(`${ serverPath }/models`)
global.User = models.User
global.Resource = models.Resource
global.Permission = models.Permission
