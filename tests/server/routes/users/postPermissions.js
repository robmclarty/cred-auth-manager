'use strict'

describe('POST /users/:id/permissions/:resource_name', () => {
  it('should allow admins to modify other users permissions')
  it('should not allow users to modify their own permissions')
  it('should allow users with permission "users:write" to modify other users permissions')
  it('should not allow users missing permission "users:write" to modify other users permissions')
})
