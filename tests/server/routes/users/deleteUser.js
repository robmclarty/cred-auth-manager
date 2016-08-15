'use strict'

const deleteUserId = 8
const deleteUser = (token, userId) => request.delete(`/users/${ userId }`)
  .set('Accept', 'application/json')
  .set('Authorization', `Bearer ${ token }`)
  .expect('Content-Type', /json/)

describe('DELETE /users/:id', () => {
  it('should allow admins to delete other users', () => {
    return login('admin', 'password')
      .then(tokens => deleteUser(tokens.accessToken, deleteUserId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
      })
  })

  it('should not allow users to delete themselves without "users:write" permission', () => {
    return login('update-user', 'password')
      .then(tokens => deleteUser(tokens.accessToken, deleteUserId).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
      })
  })

  it('should allow users with permission "users:write" to delete other users', () => {
    return login('write-user', 'password')
      .then(tokens => deleteUser(tokens.accessToken, deleteUserId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
      })
  })

  it('should not allow users missing permission "users:write" to delete other users', () => {
    return login('read-user', 'password')
      .then(tokens => deleteUser(tokens.accessToken, deleteUserId).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
      })
  })
})
