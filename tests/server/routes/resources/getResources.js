'use strict'

describe('GET /resources', () => {
  it('should allow admins to get resources')
  it('should allow users with permission "resources:read" to get resources')
  it('should not allow users missing permission "resources:read" to get resources')
})
