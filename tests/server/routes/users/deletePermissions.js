'use strict'

const resourceName = 'cred-auth-manager'
const {
  writeUserId,
  readUserId
} = require('../../helpers/user_id_helper')
const {
  login,
  deletePermissions,
  getPermissions
} = require('../../helpers/routes_helper')

describe('DELETE /users/:id/permissions/:resource_name', () => {
  it('should allow admins to delete permissions for other users', () => {
    return login('admin', 'password')
      .then(tokens => deletePermissions(tokens.accessToken, readUserId, resourceName))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true

        return login('read-user', 'password')
      })
      .then(tokens => getPermissions(tokens.accessToken, readUserId, resourceName).expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
      })
  })

  it('should allow users with permission "users:write" to delete permissions from other users', () => {
    return login('write-user', 'password')
      .then(tokens => deletePermissions(tokens.accessToken, readUserId, resourceName).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true

        return login('read-user', 'password')
      })
      .then(tokens => getPermissions(tokens.accessToken, readUserId, resourceName).expect(UNPROCESSABLE))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
      })
  })

  it('should not allow users to delete their own permissions', () => {
    return login('read-user', 'password')
      .then(tokens => deletePermissions(tokens.accessToken, readUserId, resourceName).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
      })
  })

  it('should not allow users missing permission "users:write" to delete permissions from other users', () => {
    return login('read-user', 'password')
      .then(tokens => deletePermissions(tokens.accessToken, writeUserId, resourceName).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
      })
  })
})
