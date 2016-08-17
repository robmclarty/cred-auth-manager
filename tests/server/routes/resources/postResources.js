'use strict'

const resourceProps = {
  name: 'a-brand-new-resource',
  url: 'http://somewhere.com',
  actions: ['action1', 'action2', 'action3'],
  isActive: true
}
const { login, postResources, getResource } = require('../../helpers/routes_helper')

describe('POST /resources', () => {
  it('should allow admins to create new resources', () => {
    return login('admin', 'password')
      .then(tokens => Promise.all([
        tokens.accessToken,
        postResources(tokens.accessToken, resourceProps).expect(OK)
      ]))
      .then(tokenAndRes => {
        const token = tokenAndRes[0]
        const res = tokenAndRes[1]

        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceProps.name)
        expect(res.body.resource.id).to.be.a('number')

        // Actually get the resource from the database to check that it's saved.
        return getResource(token, res.body.resource.id).expect(OK)
      })
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceProps.name)
        expect(res.body.resource.id).to.be.a('number')
      })
  })

  it('should allow users with permission "resources:write" to create new resources', () => {
    return login('write-user', 'password')
      .then(tokens => postResources(tokens.accessToken, resourceProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceProps.name)
        expect(res.body.resource.id).to.be.a('number')

        return Promise.all([
          res.body.resource.id,
          login('read-user', 'password')
        ])
      })
      .then(idAndTokens => getResource(idAndTokens[1].accessToken, idAndTokens[0]).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.resource).to.be.an('object')
        expect(res.body.resource.name).to.equal(resourceProps.name)
        expect(res.body.resource.id).to.be.a('number')
      })
  })

  it('should not allow users missing permission "resources:write" to create new resources', () => {
    return login('read-user', 'password')
      .then(tokens => postResources(tokens.accessToken, resourceProps).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })
})
