'use strict'

describe('POST /resources', () => {
  it('should allow admins to create new resources')
  it('should allow users with permission "resources:write" to create new resources')
  it('should not allow users missing permission "resources:write" to create new resources')
})
