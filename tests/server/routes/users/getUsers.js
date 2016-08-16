'use strict'

const { login, getUsers } = require('../../helpers/routes_helper')

describe('GET /users', () => {
  it('should always allow admins to list users', () => {
    return login('admin', 'password')
      .then(tokens => getUsers(tokens.accessToken).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.users).to.be.an('array')
      })
  })

  it('should allow users with permission "users:read" to list users', () => {
    return login('read-user', 'password')
      .then(tokens => getUsers(tokens.accessToken).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.users).to.be.an('array')
      })
  })

  it('should respond with UNAUTHORIZED for users missing "users:read" permission', () => {
    return login('empty-resource-perms', 'password')
      .then(tokens => getUsers(tokens.accessToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.users).to.be.undefined
      })
  })

  it('should respond with BAD REQUEST for users missing all resource permissions', () => {
    return login('other-resource-perms', 'password')
      .then(tokens => getUsers(tokens.accessToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.users).to.be.undefined
      })
  })

  it('should respond with BAD REQUEST for users with no permissions at all', () => {
    return login('no-perms', 'password')
      .then(tokens => getUsers(tokens.accessToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.users).to.be.undefined
      })
  })

  it('should not allow inactive users to list users', () => {
    return login('inactive', 'password')
      .then(tokens => getUsers(tokens.accessToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.users).to.be.undefined
      })
  })
})
