'use strict'

const resourceId = 2
const resourceUpdates = {
  name: 'another-resource-name'
}
const { login, putResource } = require('../../helpers/routes_helper')

describe('PUT /resources/:id', () => {
  it('should allow admins to modify a resource', () => {
    return login('admin', 'password')
      .then(tokens => putResource(tokens.accessToken, resourceId, resourceUpdates).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceUpdates.name)
      })
  })

  it('should allow users with permission "resources:write" to modify a resources', () => {
    return login('write-user', 'password')
      .then(tokens => putResource(tokens.accessToken, resourceId, resourceUpdates).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceUpdates.name)
      })
  })

  it('should not allow users missing permission "resources:write" to modify a resources', () => {
    return login('read-user', 'password')
      .then(tokens => putResource(tokens.accessToken, resourceId, resourceUpdates).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })
})
