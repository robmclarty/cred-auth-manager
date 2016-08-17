'use strict'

const resourceId = 1
const faceResourceId = 99999999
const resourceName = 'cred-auth-manager'
const { login, getResource } = require('../../helpers/routes_helper')

describe('GET /resources/:id', () => {
  it('should allow admins to get a resource', () => {
    return login('admin', 'password')
      .then(tokens => getResource(tokens.accessToken, resourceId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceName)
        expect(res.body.resource.id).to.equal(resourceId)
      })
  })

  it('should allow users with permission "resources:read" to get a resource', () => {
    return login('read-user', 'password')
      .then(tokens => getResource(tokens.accessToken, resourceId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceName)
        expect(res.body.resource.id).to.equal(resourceId)
      })
  })

  it('should not allow users missing permission "resources:read" to get a resource', () => {
    return login('write-user', 'password')
      .then(tokens => getResource(tokens.accessToken, resourceId).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })

  it('should respond with NOT FOUND if no resource matches id', () => {
    return login('read-user', 'password')
      .then(tokens => getResource(tokens.accessToken, faceResourceId).expect(NOT_FOUND))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })
})
