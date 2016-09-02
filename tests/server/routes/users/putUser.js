'use strict'

const { login, putUser } = require('../../helpers/routes_helper')
const { updateUserId, readUserId } = require('../../helpers/user_id_helper')
const updateProps = {
  username: 'some-other-username',
  email: 'some-other@email.com'
}

describe('PUT /users/:id', () => {
  it('should allow admins to modify other users', () => {
    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('some-other-username')
        expect(res.body.user.email).to.equal('some-other@email.com')
      })
  })

  it('should allow users to modify themselves without other permissions', () => {
    return login('update-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('some-other-username')
        expect(res.body.user.email).to.equal('some-other@email.com')
      })
  })

  it('shoudd not allow users to modify their own isAdmin attribute', () => {
    return login('update-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isAdmin: true }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isAdmin).to.be.false
      })
  })

  it('should not allow users to modify their own isActive attribute', () => {
    return login('update-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isActive: false }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isActive).to.be.true
      })
  })

  it('should allow users with permission "users:write" to modify other users', () => {
    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('some-other-username')
        expect(res.body.user.email).to.equal('some-other@email.com')
      })
  })

  it('should not allow non-admins to modify the isAdmin attribute on other users', () => {
    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isAdmin: true }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isAdmin).to.be.false
      })
  })

  it('should not allow non-admins to modify the isActive attribute on other users', () => {
    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, { isActive: false }).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('update-user')
        expect(res.body.user.isActive).to.be.true
      })
  })

  it('should not allow users missing permission "users:write" to modify other users', () => {
    return login('no-perms', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, updateProps).expect(UNAUTHORIZED))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate usernames to be set', () => {
    const dupUsernameProps = { username: 'read-user' }

    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, dupUsernameProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should not allow duplicate emails to be set', () => {
    const dupEmailProps = { email: 'read-user@email.com' }

    return login('write-user', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, dupEmailProps).expect(CONFLICT))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.false
        expect(res.body.user).to.be.undefined
      })
  })

  it('should ignore invalid attributes on the user object sent in the request', () => {
    const invalidProps = { invalid: 'this should not be saved' }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, updateUserId, invalidProps).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.invalid).to.be.undefined
      })
  })

  it('should update permissions if they are included in body', () => {
    const updates = {
      permissions: {
        'cred-auth-manager': {
          actions: ['users:read', 'users:write', 'resources:write']
        }
      }
    }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
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
    const updates = {
      permissions: {
        'invalid-resource': {
          actions: ['this', 'is', 'not', 'real']
        },
        'cred-auth-manager': {
          actions: ['users:write', 'users:read']
        }
      }
    }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
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
    const updates = {
      permissions: {
        'some-other-resource': {
          actions: ['action1', 'action2']
        },
        'cred-auth-manager': {
          actions: ['users:write', 'users:read']
        }
      }
    }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
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
    const updates = {
      permissions: {
        'some-other-resource': {
          actions: ['action1', 'not-valid']
        },
        'cred-auth-manager': {
          actions: ['users:write', 'this-should-not-save', 'users:read']
        }
      }
    }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
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
    const updates = {
      permissions: 'should-be-an-object'
    }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('permissions:read')
      })
  })

  it('should ignore permissions if actions are not formatted correclty', () => {
    const updates = {
      permissions: {
        'cred-auth-manager': {
          actions: 'not-an-array'
        }
      }
    }

    return login('admin', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.permissions).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('permissions:read')
      })
  })

  it('should ignore permissions updates for users without authorization to modify permissions', () => {
    const updates = {
      username: 'new-username',
      permissions: {
        'cred-auth-manager': {
          actions: ['users:write']
        }
      }
    }

    return login('read-user', 'password')
      .then(tokens => putUser(tokens.accessToken, readUserId, updates).expect(OK))
      .then(res => {
        expect(res).not.to.be.null
        expect(res.body.success).to.be.true
        expect(res.body.user).to.be.an('object')
        expect(res.body.user.username).to.equal('new-username')
        expect(res.body.user.permissions).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager']).to.be.an('object')
        expect(res.body.user.permissions['cred-auth-manager'].actions).not.to.include('users:write')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('users:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('resources:read')
        expect(res.body.user.permissions['cred-auth-manager'].actions).to.include('permissions:read')
      })
  })
})
