'use strict'

describe('PUT /tokens', () => {
  it('should respond with a fresh access token given a valid refresh token')
  it('should respond with UNAUTHORIZED if refresh token is missing')
  it('should respond with UNAUTHORIZED if token is not a refresh token')
  it('should respond with UNAUTHORIZED if refresh token is fake')
  it('should respond with UNAUTHORIZED if refresh token is badly formatted')
  it('should respond with UNAUTHORIZED if refresh token has been revoked')
  it('should not create a new access token if the provided refresh token is expired')
})
