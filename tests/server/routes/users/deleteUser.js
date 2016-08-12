'use strict'

describe('DELETE /users/:id', () => {
  it('should allow admins to delete other users')
  it('should allow users to delete themselves')
  it('should allow users with permission "users:write" to delete other users')
  it('should not allow users missing permission "users:write" to delete other users')
})
