'use strict'

const resourceName = 'cred-auth-manager'
const {
  writeUserId,
  readUserId
} = require('../../helpers/user_id_helper')
const { login, postPermissions } = require('../../helpers/routes_helper')
const invalidActions = [
  'action1',
  'action2'
]
const validActions = [
  'users:write',
  'resources:write'
]

describe('POST /users/:id/permissions/:resource_name', () => {
  it('should allow admins to modify other users permissions', () => {
    return login('admin', 'password')
      .then(tokens => postPermissions(
        tokens.accessToken,
        readUserId,
        resourceName,
        validActions
      ).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('users:write')
        expect(res.body.actions).to.include('resources:write')
        expect(res.body.actions).not.to.include('users:read')
        expect(res.body.actions).not.to.include('resources:read')
        expect(res.body.actions).not.to.include('permissions:read')
      })
  })

  it('should not allow users to modify their own permissions', () => {
    return login('read-user', 'password')
      .then(tokens => postPermissions(
        tokens.accessToken,
        readUserId,
        resourceName,
        validActions
      ).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should allow users with permission "users:write" to modify other users permissions', () => {
    return login('write-user', 'password')
      .then(tokens => postPermissions(
        tokens.accessToken,
        readUserId,
        resourceName,
        validActions
      ).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('users:write')
        expect(res.body.actions).to.include('resources:write')
        expect(res.body.actions).not.to.include('users:read')
        expect(res.body.actions).not.to.include('resources:read')
        expect(res.body.actions).not.to.include('permissions:read')
      })
  })

  it('should not allow users missing permission "users:write" to modify other users permissions', () => {
    return login('read-user', 'password')
      .then(tokens => postPermissions(
        tokens.accessToken,
        writeUserId,
        resourceName,
        validActions
      ).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should respond with BAD REQUEST if no "actions" attribute is sent in the body', () => {
    return login('admin', 'password')
      .then(tokens => request.post(`/users/${ readUserId }/permissions/${ resourceName }`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${ tokens.accessToken }`)
        .expect('Content-Type', /json/)
        .expect(BAD_REQUEST))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })

  it('should ignore invalid actions (actions which are not set in the resource itself)', () => {
    return login('admin', 'password')
      .then(tokens => postPermissions(
        tokens.accessToken,
        readUserId,
        resourceName,
        [...invalidActions, 'users:read']
      ).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('users:read')
        expect(res.body.actions).not.to.include('action1')
        expect(res.body.actions).not.to.include('action2')
        expect(res.body.actions).not.to.include('resources:read')
        expect(res.body.actions).not.to.include('permissions:read')
      })
  })
})
