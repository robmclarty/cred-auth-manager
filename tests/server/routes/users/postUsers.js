'use strict'

describe('POST /users', () => {
  it('should allow admins to create new users')
  it('should allow admins to set the isAdmin attribute on new users')
  it('should allow admins to set the isActive attribute on new users')
  it('should allow users with permission "users:write" to create new users')
  it('should not allow non-admins to set the isAdmin attribute on new users')
  it('should not allow non-admins to set the isActive attribute on new users')
  it('should not allow users missing permission "users:write" to create new users')
})
