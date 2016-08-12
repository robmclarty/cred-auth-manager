'use strict'

describe('PUT /users/:id', () => {
  it('should allow admins to modify other users')
  it('should allow users to modify themselves')
  it('shoudd not allow users to modify their own isAdmin attribute')
  it('should not allow users to modify their own isActive attribute')
  it('should allow users with permission "users:write" to modify other users')
  it('should not allow non-admins to modify the isAdmin attribute on other users')
  it('should not allow non-admins to modify the isActive attribute on other users')
  it('should not allow users missing permission "users:write" to modify other users')
  it('should not allow duplicate usernames to be set')
  it('should not allow duplicate emails to be set')
})
