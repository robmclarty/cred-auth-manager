'use strict'

describe('DELETE /resources/:id', () => {
  it('should allow admins to delete a resource')
  it('should allow users with permission "resources:write" to delete a resources')
  it('should not allow users missing permission "resources:write" to delete a resources')
})
