'use strict'

const base64 = require('base64-url')
const { login, putTokens, deleteTokens } = require('../../helpers/routes_helper')

describe('PUT /tokens', () => {
  it('should respond with a fresh access token given a valid refresh token', () => {
    return login('read-user', 'password')
      .then(tokens => putTokens(tokens.refreshToken).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.tokens).to.be.an('object')
        expect(res.body.tokens.refreshToken).to.be.a('string')
      })
  })

  it('should respond with BAD REQUEST if refresh token is missing', () => {
    return putTokens('').expect(BAD_REQUEST)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if token is not a refresh token', () => {
    return login('read-user', 'password')
      .then(tokens => putTokens(tokens.accessToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if refresh token has been revoked', () => {
    let revokedToken = ''

    return login('read-user', 'password')
      .then(tokens => deleteTokens(tokens.refreshToken).expect(OK))
      .then(res => putTokens(res.body.token).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if refresh token is expired', () => {
    return cred.createToken({
      payload: {},
      issuer: config.issuer,
      secret: config.refresh.secret,
      algorithm: config.refresh.algorithm,
      expiresIn: -1,
      subject: 'refresh'
    })
      .then(expiredRefreshToken => cred.register(expiredRefreshToken))
      .then(expiredRefreshToken => putTokens(expiredRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if refresh token has the wrong secret', () => {
    return cred.createToken({
      payload: {},
      issuer: config.issuer,
      secret: 'fake-secret',
      algorithm: config.refresh.algorithm,
      expiresIn: config.refresh.expiresIn,
      subject: 'refresh'
    })
      .then(invalidRefreshToken => cred.register(invalidRefreshToken))
      .then(invalidRefreshToken => putTokens(invalidRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if refresh token has wrong issuer', () => {
    return cred.createToken({
      payload: {},
      issuer: 'fake-issuer',
      secret: config.refresh.secret,
      algorithm: config.refresh.algorithm,
      expiresIn: config.refresh.expiresIn,
      subject: 'refresh'
    })
      .then(invalidRefreshToken => cred.register(invalidRefreshToken))
      .then(invalidRefreshToken => putTokens(invalidRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if refresh token uses the wrong algorithm', () => {
    return cred.createToken({
      payload: {},
      issuer: config.issuer,
      secret: config.refresh.secret,
      algorithm: 'HS256',
      expiresIn: config.refresh.expiresIn,
      subject: 'refresh'
    })
      .then(invalidRefreshToken => cred.register(invalidRefreshToken))
      .then(invalidRefreshToken => putTokens(invalidRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should respond with UNAUTHORIZED if refresh token has been tampered with (no longer matches signature)', () => {
    return cred.createToken({
      payload: {},
      issuer: config.issuer,
      secret: config.refresh.secret,
      algorithm: config.refresh.algorithm,
      expiresIn: config.refresh.expiresIn,
      subject: 'refresh'
    })
      .then(validRefreshToken => cred.register(validRefreshToken))
      .then(validRefreshToken => {
        const tokenParts = validRefreshToken.split('.')
        const payload = JSON.parse(base64.decode(tokenParts[1]))

        // Add a new attribute to the payload.
        payload.userId = 4
        tokenParts[1] = base64.encode(JSON.stringify(payload))

        return tokenParts.join('.')
      })
      .then(modifiedRefreshToken => putTokens(modifiedRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })
})
