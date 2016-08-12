'use strict'

describe('POST /tokens', () => {
  it('should respond with access and refresh tokens given valid username/password')
  it('should respond with UNAUTHORIZED if username or password do not match')
  it('should respond with BAD REQUEST if username does not match any user')
  it('should respond with BAD REQUEST if username is missing from request')
  it('should respond with BAD REQUEST if password is missing from request')
})
