'use strict'

const { login, postUsers } = require('../../helpers/routes_helper')
const userProps = {
  username: 'sample-user',
  password: 'password',
  email: 'sample-user@email.com'
}
const adminProps = Object.assign({}, userProps, { isAdmin: true })
const inactiveProps = Object.assign({}, userProps, { isActive: false })

describe('POST /users', () => {
  it('should allow admins to create new users', () => {
    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, userProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
      })
  })

  it('should allow admins to set the isAdmin attribute on new users', () => {
    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, adminProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isAdmin).to.be.true
      })
  })

  it('should allow admins to set the isActive attribute on new users', () => {
    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, inactiveProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isActive).to.be.false
      })
  })

  it('should allow users with permission "users:write" to create new users', () => {
    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, userProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
      })
  })

  it('should not allow non-admins to set the isAdmin attribute on new users', () => {
    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, adminProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isAdmin).to.be.false
      })
  })

  it('should not allow non-admins to set the isActive attribute on new users', () => {
    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, inactiveProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isActive).to.be.true
      })
  })

  it('should not allow users missing permission "users:write" to create new users', () => {
    return login('empty-resource-perms', 'password')
      .then(tokens => postUsers(tokens.accessToken, userProps).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate usernames to be created', () => {
    const dupUsernameProps = Object.assign({}, userProps, { username: 'read-user' })

    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, dupUsernameProps).expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate emails to be created', () => {
    const dupEmailProps = Object.assign({}, userProps, { email: 'read-user@email.com' })

    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, dupEmailProps).expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })
})
