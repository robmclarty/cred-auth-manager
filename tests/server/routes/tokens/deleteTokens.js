'use strict'

const base64 = require('base64-url')
const {
  login,
  deleteTokens,
  deleteTokensTargeted
} = require('../../helpers/routes_helper')
const readUserId = 4

describe('DELETE /tokens', () => {
  it('should allow users to revoke their own refresh token', () => {
    let revokedToken = ''

    return login('read-user', 'password')
      .then(tokens => {
        revokedToken = tokens.refreshToken

        return deleteTokens(tokens.refreshToken).expect(OK)
      })
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.token).to.equal(revokedToken)
      })
  })

  it('should not allow users to revoke a token that is already revoked', () => {
    let revokedToken = ''

    return login('read-user', 'password')
      .then(tokens => deleteTokens(tokens.refreshToken).expect(OK))
      .then(res => deleteTokens(res.body.token).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.tokens).to.be.undefined
      })
  })

  it('should allow admins to revoke refresh token for other users', () => {
    let revokedToken = ''

    return Promise.all([
      login('admin', 'password'),
      login('read-user', 'password')
    ])
      .then(tokens => {
        const adminRefreshToken = tokens[0].refreshToken
        const userRefreshToken = tokens[1].refreshToken

        revokedToken = userRefreshToken

        return deleteTokensTargeted(adminRefreshToken, userRefreshToken).expect(OK)
      })
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.token).to.equal(revokedToken)

        // Test that the userRefreshToken can't be re-used.
        return deleteTokens(revokedToken).expect(UNAUTHORIZED)
      })
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
      })
  })

  it('should not allow non-admin users to revoke refresh tokens for other users', () => {
    return Promise.all([
      login('read-user', 'password'),
      login('write-user', 'password')
    ])
      .then(tokens => {
        const user1RefreshToken = tokens[0].refreshToken
        const user2RefreshToken = tokens[1].refreshToken

        return deleteTokensTargeted(user1RefreshToken, user2RefreshToken).expect(FORBIDDEN)
      })
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
      })
  })

  it('should respond with BAD REQUEST if refresh token is missing', () => {
    return deleteTokens('').expect(BAD_REQUEST)
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
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
      .then(expiredRefreshToken => deleteTokens(expiredRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
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
      .then(invalidRefreshToken => deleteTokens(invalidRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
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
      .then(invalidRefreshToken => deleteTokens(invalidRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
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
      .then(invalidRefreshToken => deleteTokens(invalidRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
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
      .then(modifiedRefreshToken => deleteTokens(modifiedRefreshToken).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.token).to.be.undefined
      })
  })
})
