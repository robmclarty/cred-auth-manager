'use strict'

const resourceId = 1
const { login, deleteResource, getResource } = require('../../helpers/routes_helper')

describe('DELETE /resources/:id', () => {
  it('should allow admins to delete a resource', () => {
    return login('admin', 'password')
      .then(tokens => deleteResource(tokens.accessToken, resourceId))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true

        return login('admin', 'password')
      })
      .then(tokens => getResource(tokens.accessToken, resourceId).expect(NOT_FOUND))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })

  it('should allow users with permission "resources:write" to delete a resources', () => {
    return login('write-user', 'password')
      .then(tokens => deleteResource(tokens.accessToken, resourceId).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true

        return login('admin', 'password')
      })
      .then(tokens => getResource(tokens.accessToken, resourceId).expect(NOT_FOUND))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })

  it('should not allow users missing permission "resources:write" to delete a resources', () => {
    return login('read-user', 'password')
      .then(tokens => deleteResource(tokens.accessToken, resourceId).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })
})
