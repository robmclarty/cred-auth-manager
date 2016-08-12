'use strict'

describe('GET /resources/:id/actions', () => {
  it('should allow admins to get resource actions')
  it('should allow users with permission "resources:read" to get resource actions')
  it('should not allow users missing permission "resources:read" to get resource actions')
})
