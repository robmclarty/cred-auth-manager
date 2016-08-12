'use strict'

describe('DELETE /tokens', () => {
  it('should allow admins to revoke refresh token for other users')
  it('should allow users to revoke their own refresh token')
  it('should not allow users to revoke refresh tokens for other users')
  it('should respond with UNAUTHORIZED if refresh token is expired')
  it('should respond with UNAUTHORIZED if refresh token is fake')
  it('should respond with UNAUTHORIZED if refresh token is badly formatted')
})
