'use strict'

describe('DELETE /resources/:id/actions', () => {
  it('should allow admins to delete resource actions')
  it('should allow users with permission "resources:write" to delete resources actions')
  it('should not allow users missing permission "resources:write" to delete resources actions')
})
