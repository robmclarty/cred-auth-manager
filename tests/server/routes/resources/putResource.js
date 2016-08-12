'use strict'

describe('PUT /resources/:id', () => {
  it('should allow admins to modify a resource')
  it('should allow users with permission "resources:write" to modify a resources')
  it('should not allow users missing permission "resources:write" to modify a resources')
})
