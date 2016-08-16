'use strict'

const { postTokens } = require('../../helpers/routes_helper')

describe('POST /tokens', () => {
  it('should respond with access and refresh tokens given valid username/password', () => {
    return postTokens({
      username: 'read-user',
      password: 'password'
    })
      .expect(OK)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.tokens).to.be.an('object')
        expect(res.body.tokens.accessToken).to.be.a('string')
        expect(res.body.tokens.refreshToken).to.be.a('string')
      })
  })

  it('should respond with UNAUTHORIZED if username or password do not match', () => {
    return postTokens({
      username: 'read-user',
      password: '?????????'
    })
      .expect(UNAUTHORIZED)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if username does not match any user', () => {
    return postTokens({
      username: 'unknown-user',
      password: 'password'
    })
      .expect(UNAUTHORIZED)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if username is missing from request', () => {
    return postTokens({
      password: 'password'
    })
      .expect(UNAUTHORIZED)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if password is missing from request', () => {
    return postTokens({
      username: 'unknown-user',
      password: 'password'
    })
      .expect(UNAUTHORIZED)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })
})
