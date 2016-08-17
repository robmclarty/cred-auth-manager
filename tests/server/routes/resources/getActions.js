'use strict'

const resourceId = 1
const { login, getResourceActions } = require('../../helpers/routes_helper')

describe('GET /resources/:id/actions', () => {
  it('should allow admins to get resource actions', () => {
    return login('admin', 'password')
      .then(tokens => getResourceActions(tokens.accessToken, resourceId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
      })
  })

  it('should allow users with permission "resources:read" to get resource actions', () => {
    return login('read-user', 'password')
      .then(tokens => getResourceActions(tokens.accessToken, resourceId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
      })
  })

  it('should not allow users missing permission "resources:read" to get resource actions', () => {
    return login('write-user', 'password')
      .then(tokens => getResourceActions(tokens.accessToken, resourceId).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })
})
