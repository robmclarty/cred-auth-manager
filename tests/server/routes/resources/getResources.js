'use strict'

const { login, getResources } = require('../../helpers/routes_helper')

describe('GET /resources', () => {
  it('should allow admins to list resources', () => {
    return login('admin', 'password')
      .then(tokens => getResources(tokens.accessToken).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resources).to.be.an('array')
      })
  })

  it('should allow users with permission "resources:read" to list resources', () => {
    return login('read-user', 'password')
      .then(tokens => getResources(tokens.accessToken).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resources).to.be.an('array')
      })
  })

  it('should not allow users missing permission "resources:read" to list resources', () => {
    return login('write-user', 'password')
      .then(tokens => getResources(tokens.accessToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resources).to.be.undefined
      })
  })
})
