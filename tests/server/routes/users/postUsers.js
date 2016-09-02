'use strict'

const { login, postUsers } = require('../../helpers/routes_helper')
const userProps = {
  username: 'sample-user',
  password: 'password',
  email: 'sample-user@email.com'
}
const adminProps = Object.assign({}, userProps, { isAdmin: true })
const inactiveProps = Object.assign({}, userProps, { isActive: false })

describe('POST /users', () => {
  it('should allow admins to create new users', () => {
    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, userProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
      })
  })

  it('should allow admins to set the isAdmin attribute on new users', () => {
    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, adminProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isAdmin).to.be.true
      })
  })

  it('should allow admins to set the isActive attribute on new users', () => {
    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, inactiveProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isActive).to.be.false
      })
  })

  it('should allow users with permission "users:write" to create new users', () => {
    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, userProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
      })
  })

  it('should not allow non-admins to set the isAdmin attribute on new users', () => {
    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, adminProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isAdmin).to.be.false
      })
  })

  it('should not allow non-admins to set the isActive attribute on new users', () => {
    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, inactiveProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('sample-user')
        expect(res.body.user.isActive).to.be.true
      })
  })

  it('should not allow users missing permission "users:write" to create new users', () => {
    return login('empty-resource-perms', 'password')
      .then(tokens => postUsers(tokens.accessToken, userProps).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate usernames to be created', () => {
    const dupUsernameProps = Object.assign({}, userProps, { username: 'read-user' })

    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, dupUsernameProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate emails to be created', () => {
    const dupEmailProps = Object.assign({}, userProps, { email: 'read-user@email.com' })

    return login('write-user', 'password')
      .then(tokens => postUsers(tokens.accessToken, dupEmailProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should add permissions if they are included in body', () => {
    const props = Object.assign({}, userProps, {
      permissions: {
        'cred-auth-manager': {
          actions: ['users:read', 'users:write', 'resources:write']
        }
      }
    })

    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')

        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('resources:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('permissions:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('permissions:read')
      })
  })

  it('should ignore permissions that do not exist as resources', () => {
    const props = Object.assign({}, userProps, {
      permissions: {
        'invalid-resource': {
          actions: ['this', 'is', 'not', 'real']
        },
        'cred-auth-manager': {
          actions: ['users:write', 'users:read']
        }
      }
    })

    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')

        expect(res.body.user.permissions['invalid-resource']).to.be.undefined

        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('permissions:read')
      })
  })

  it('should update permissions for multiple resources if they are valid', () => {
    const props = Object.assign({}, userProps, {
      permissions: {
        'some-other-resource': {
          actions: ['action1', 'action2']
        },
        'cred-auth-manager': {
          actions: ['users:write', 'users:read']
        }
      }
    })

    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')

        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('permissions:read')

        expect(res.body.user.permissions['some-other-resource']).to.be.an('object')
        expect(res.body.user.permissions['some-other-resource'].actions).to.include('action1')
        expect(res.body.user.permissions['some-other-resource'].actions).to.include('action2')
        expect(res.body.user.permissions['some-other-resource'].actions).not.to.include('action3')
      })
  })

  it('should ignore invalid actions for resources, but include valid ones', () => {
    const props = Object.assign({}, userProps, {
      permissions: {
        'some-other-resource': {
          actions: ['action1', 'not-valid']
        },
        'cred-auth-manager': {
          actions: ['users:write', 'this-should-not-save', 'users:read']
        }
      }
    })

    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')

        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('permissions:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('this-should-not-save')

        expect(res.body.user.permissions['some-other-resource']).to.be.an('object')
        expect(res.body.user.permissions['some-other-resource'].actions).to.include('action1')
        expect(res.body.user.permissions['some-other-resource'].actions).not.to.include('action2')
        expect(res.body.user.permissions['some-other-resource'].actions).not.to.include('action3')
        expect(res.body.user.permissions['some-other-resource'].actions).not.to.include('not-valid')
      })
  })

  it('should ignore permissions if they are not formatted correctly', () => {
    const props = Object.assign({}, userProps, {
      permissions: 'should-be-an-object'
    })

    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')
        expect(res.body.user.permissions).to.be.empty
      })
  })

  it('should ignore permissions if actions are not formatted correclty', () => {
    const props = Object.assign({}, userProps, {
      permissions: {
        'cred-auth-manager': {
          actions: 'not-an-array'
        }
      }
    })

    return login('admin', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')
        expect(res.body.user.permissions).to.be.empty
        expect(res.body.user.permissions['cred-auth-manager']).to.be.undefined
      })
  })

  it('should ignore permissions for users without authorization to modify permissions', () => {
    const props = Object.assign({}, userProps, {
      username: 'new-username',
      permissions: {
        'cred-auth-manager': {
          actions: ['users:write']
        }
      }
    })

    return login('write-user-no-perms', 'password')
      .then(tokens => postUsers(tokens.accessToken, props).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('new-username')
        expect(res.body.user.permissions).to.be.an('object')
        expect(res.body.user.permissions).to.be.empty
        expect(res.body.user.permissions['cred-auth-manager']).to.be.undefined
      })
  })
})
