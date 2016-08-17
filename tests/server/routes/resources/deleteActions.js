'use strict'

const resourceId = 2
const { login, deleteResourceActions } = require('../../helpers/routes_helper')
const removedActions = ['action2', 'action1']

describe('DELETE /resources/:id/actions', () => {
  it('should allow admins to delete resource actions', () => {
    return login('admin', 'password')
      .then(tokens => deleteResourceActions(tokens.accessToken, resourceId, removedActions).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('action3')
        expect(res.body.actions).not.to.include('action1')
        expect(res.body.actions).not.to.include('action2')
      })
  })

  it('should allow users with permission "resources:write" to delete resources actions', () => {
    return login('write-user', 'password')
      .then(tokens => deleteResourceActions(tokens.accessToken, resourceId, removedActions).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('action3')
        expect(res.body.actions).not.to.include('action1')
        expect(res.body.actions).not.to.include('action2')
      })
  })

  it('should not allow users missing permission "resources:write" to delete resources actions', () => {
    return login('read-user', 'password')
      .then(tokens => deleteResourceActions(tokens.accessToken, resourceId, removedActions).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })
})
