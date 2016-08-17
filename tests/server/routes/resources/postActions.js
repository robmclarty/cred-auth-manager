'use strict'

const resourceId = 2
const { login, putResourceActions } = require('../../helpers/routes_helper')
const actions = ['actionA', 'actionB']

// New actions should be *added to*, that is, not *replacing*, existing actions.
describe('POST /resources/:id/actions', () => {
  it('should allow admins to modify resource actions', () => {
    return login('admin', 'password')
      .then(tokens => putResourceActions(tokens.accessToken, resourceId, actions).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('actionA')
        expect(res.body.actions).to.include('actionB')
        expect(res.body.actions).to.include('action1')
        expect(res.body.actions).to.include('action2')
        expect(res.body.actions).to.include('action3')
      })
  })

  it('should allow users with permission "resources:write" to modify resource actions', () => {
    return login('write-user', 'password')
      .then(tokens => putResourceActions(tokens.accessToken, resourceId, actions).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.actions).to.be.an('array')
        expect(res.body.actions).to.include('actionA')
        expect(res.body.actions).to.include('actionB')
        expect(res.body.actions).to.include('action1')
        expect(res.body.actions).to.include('action2')
        expect(res.body.actions).to.include('action3')
      })
  })

  it('should not allow users missing permission "resources:write" to modify resource actions', () => {
    return login('read-user', 'password')
      .then(tokens => putResourceActions(tokens.accessToken, resourceId, actions).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.actions).to.be.undefined
      })
  })
})
