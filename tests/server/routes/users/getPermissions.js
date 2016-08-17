'use strict'

const resourceName = 'cred-auth-manager'
const {
  writeUserId,
  readUserId,
  noPermsUserId,
  inactiveUserId,
  invalidUserId
} = require('../../helpers/user_id_helper')
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

  it('should allow users to get their own permissions without having "users:read"', () => {
    return login('write-user', 'password')
      .then(tokens => getPermissions(tokens.accessToken, writeUserId, resourceName).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
      })
  })

  it('should allow users with permission "users:read" to get permissions from other users', () => {
    return login('read-user', 'password')
      .then(tokens => getPermissions(tokens.accessToken, writeUserId, resourceName).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
      })
  })

  it('should not allow users missing permission "users:read" to get permissions from other users', () => {
    return login('write-user', 'password')
      .then(tokens => getPermissions(tokens.accessToken, readUserId, resourceName).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should respond with UNPROCESSABLE if userId is not a number', () => {
    return login('read-user', 'password')
      .then(tokens => getPermissions(tokens.accessToken, 'not-a-user-id', resourceName).expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should respond with NOT FOUND if userId does not match a real user', () => {
    return login('read-user', 'password')
      .then(tokens => getPermissions(tokens.accessToken, invalidUserId, resourceName).expect(NOT_FOUND))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should respond with UNPROCESSABLE if no resourceName is not valid', () => {
    return login('read-user', 'password')
      .then(tokens => getPermissions(tokens.accessToken, readUserId, 'not-a-resource-name').expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should respond with UNPROCESSABLE if user has no permissions for :resource_name', () => {
    return login('no-perms', 'password')
      .then(tokens => getPermissions(tokens.accessToken, noPermsUserId, resourceName).expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })
})
