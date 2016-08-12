'use strict'

describe('GET /resources/:id', () => {
  it('should allow admins to get a resource')
  it('should allow users with permission "resources:read" to get a resource')
  it('should not allow users missing permission "resources:read" to get a resource')
})
