'use strict'

describe('POST /resources/:id/actions', () => {
  it('should allow admins to modify resource actions')
  it('should allow users with permission "resources:write" to modify resource actions')
  it('should not allow users missing permission "resources:write" to modify resource actions')
})
