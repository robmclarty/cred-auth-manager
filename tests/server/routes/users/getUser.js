'use strict'

const noPermsUserId = 2
const getUser = (token, userId) => request.get(`/users/${ userId }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

describe('GET /users/:id', () => {
  it('should allow admins to get a user other than themselves', () => {
    return login('admin', 'password')
      .then(tokens => getUser(tokens.accessToken, noPermsUserId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('no-perms')
      })
  })

  it('should allow a user to get themselves, even if they do not have other permissions', () => {
    return login('no-perms', 'password')
      .then(tokens => getUser(tokens.accessToken, noPermsUserId))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('no-perms')
      })
  })

  it('should allow a user with permission "users:read" to get another user', () => {
    return login('read-user', 'password')
      .then(tokens => getUser(tokens.accessToken, noPermsUserId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('no-perms')
      })
  })

  it('should not allow a user missing permission "users:read" to get another user', () => {
    return login('empty-resource-perms', 'password')
      .then(tokens => getUser(tokens.accessToken, noPermsUserId).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })
})
