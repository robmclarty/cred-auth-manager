'use strict'

const { login, putUser } = require('../../helpers/routes_helper')
const updateUserId = 8
const updateProps = {
  username: 'some-other-username',
  email: 'some-other@email.com'
}

describe('PUT /users/:id', () => {
  it('should allow admins to modify other users', () => {
    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('some-other-username')
        expect(res.body.user.email).to.equal('some-other@email.com')
      })
  })

  it('should allow users to modify themselves without other permissions', () => {
    return login('update-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('some-other-username')
        expect(res.body.user.email).to.equal('some-other@email.com')
      })
  })

  it('shoudd not allow users to modify their own isAdmin attribute', () => {
    return login('update-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isAdmin: true }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isAdmin).to.be.false
      })
  })

  it('should not allow users to modify their own isActive attribute', () => {
    return login('update-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isActive: false }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isActive).to.be.true
      })
  })

  it('should allow users with permission "users:write" to modify other users', () => {
    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('some-other-username')
        expect(res.body.user.email).to.equal('some-other@email.com')
      })
  })

  it('should not allow non-admins to modify the isAdmin attribute on other users', () => {
    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isAdmin: true }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isAdmin).to.be.false
      })
  })

  it('should not allow non-admins to modify the isActive attribute on other users', () => {
    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isActive: false }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isActive).to.be.true
      })
  })

  it('should not allow users missing permission "users:write" to modify other users', () => {
    return login('no-perms', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate usernames to be set', () => {
    const dupUsernameProps = { username: 'read-user' }

    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, dupUsernameProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate emails to be set', () => {
    const dupEmailProps = { email: 'read-user@email.com' }

    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, dupEmailProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })
})
