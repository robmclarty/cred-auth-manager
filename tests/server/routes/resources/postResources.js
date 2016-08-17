'use strict'

const existingResourceName = 'cred-auth-manager'
const resourceProps = {
  name: 'a-brand-new-resource',
  url: 'http://somewhere.com',
  actions: ['action1', 'action2', 'action3'],
  isActive: true
}
const { login, postResources, getResource } = require('../../helpers/routes_helper')
const expectUpdatedResource = resource => {
  expect(resource).to.be.an('object')
  expect(resource.name).to.equal(resourceProps.name)
  expect(resource.url).to.equal(resourceProps.url)
  expect(resource.id).to.be.a('number')
  expect(resource.actions).to.be.an('array')
  expect(resource.actions).to.include('action1')
  expect(resource.actions).to.include('action2')
  expect(resource.actions).to.include('action3')
  expect(resource.isActive).to.be.true
}

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
        expectUpdatedResource(res.body.resource)

        // Actually get the resource from the database to check that it's saved.
        return getResource(token, res.body.resource.id).expect(OK)
      })
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expectUpdatedResource(res.body.resource)
      })
  })

  it('should allow users with permission "resources:write" to create new resources', () => {
    return login('write-user', 'password')
      .then(tokens => postResources(tokens.accessToken, resourceProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expectUpdatedResource(res.body.resource)

        return Promise.all([
          res.body.resource.id,
          login('read-user', 'password')
        ])
      })
      .then(idAndTokens => getResource(idAndTokens[1].accessToken, idAndTokens[0]).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expectUpdatedResource(res.body.resource)
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

  it('should ignore non-resource props and return OK', () => {
    const extraResourceProps = Object.assign({}, resourceProps, {
      extraProp: 'should-be-ignored'
    })

    return login('write-user', 'password')
      .then(tokens => postResources(tokens.accessToken, extraResourceProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expectUpdatedResource(res.body.resource)
        expect(res.body.resource.extraProp).to.be.undefined

        return Promise.all([
          res.body.resource.id,
          login('read-user', 'password')
        ])
      })
      .then(idAndTokens => getResource(idAndTokens[1].accessToken, idAndTokens[0]).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expectUpdatedResource(res.body.resource)
        expect(res.body.resource.extraProp).to.be.undefined
      })
  })

  it('should respond with CONFLICT if new resource name already exists', () => {
    const conflictingResourceProps = Object.assign({}, resourceProps, {
      name: existingResourceName
    })

    return login('admin', 'password')
      .then(tokens => postResources(tokens.accessToken, conflictingResourceProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.resource).to.be.undefined
      })
  })
})
