'use strict'

describe('DELETE /users/:id/permissions/:resource_name', () => {
  it('should allow admins to delete permissions for other users')
  it('should allow users to delete their own permissions')
  it('should allow users with permission "users:write" to delete permissions from other users')
  it('should not allow users missing permission "users:write" to delete permissions from other users')
})
