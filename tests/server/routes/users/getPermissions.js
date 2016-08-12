'use strict'

describe('GET /users/:id/permissions/:resource_name', () => {
  it('should allow admins to get permissions from other users')
  it('should allow users to get their own permissions')
  it('should allow users with permission "users:read" to get permissions from other users')
  it('should not allow users missing permission "users:read" to get permissions from other users')
})
