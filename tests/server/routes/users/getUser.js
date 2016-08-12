'use strict'

describe('GET /users/:id', () => {
  it('should allow admins to get a user other than themselves')
  it('should allow a user to get themselves')
  it('should allow a user with permission "users:read" to get another user')
  it('should not allow a user missing permission "users:read" to get another user')
})
