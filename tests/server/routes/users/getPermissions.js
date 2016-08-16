'use strict'

const readUserId = 4
const noPermsUserId = 2
const resourceName = 'cred-auth-manager'
const { login, getPermissions } = require('../../helpers/routes_helper')

describe('GET /users/:id/permissions/:resource_name', () => {
  it('should allow admins to get permissions from other users', () => {
    return login('admin', 'password')
      .then(tokens => getPermissions(tokens.accessToken, readUserId, resourceName).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
      })
  })

  it('should allow users to get their own permissions')

  it('should allow users with permission "users:read" to get permissions from other users')

  it('should not allow users missing permission "users:read" to get permissions from other users')

  it('should respond with BAD REQUEST if no userId is provided')

  it('should respond with BAD REQUEST if no resourceName is provided')

  it('should respond with BAD REQUEST if user has no permissions for :resource_name')
})
