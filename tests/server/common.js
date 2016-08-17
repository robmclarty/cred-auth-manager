'use strict'

const configPath = '../../config'
const serverPath = '../../server'

// Env Vars
process.env.NODE_ENV = 'test'
process.env.DATABASE = require(`${ configPath }/database`).test

// Utils
global.chai = require('chai')
global.expect = chai.expect
global.supertest = require('supertest-as-promised')(Promise)
global.cred = require(`${ serverPath }/cred`)
global.config = require(`${ configPath }/server`)
global.app = require(serverPath)
global.request = supertest.agent(app)

// Response Codes
global.OK = 200
global.BAD_REQUEST = 400
global.UNAUTHORIZED = 401
global.FORBIDDEN = 403
global.NOT_FOUND = 404
global.UNPROCESSABLE = 422
global.GENERIC_ERROR = 500

// Models
global.models = require(`${ serverPath }/models`)
global.User = models.User
global.Resource = models.Resource
global.Permission = models.Permission
