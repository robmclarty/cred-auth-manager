'use strict'

const { createError, BAD_REQUEST, UNPROCESSABLE, NOT_FOUND } = require('../helpers/error_helper')
const { User, Resource, Permission, Friendship } = require('../models')

const isAuthorizedToWritePermissions = (auth, appName) => {
  const appPermission = auth.permissions[appName]

  return auth.isAdmin || (
    appPermission &&
    Array.isArray(appPermission.actions) &&
    appPermission.actions.includes('permissions:write')
  )
}

const findUserById = userId => User.findById(userId, {
  include: [
    {
      model: Permission,
      include: [Resource]
    },
    {
      model: Friendship,
      include: [{
        model: User,
        attributes: ['id', 'username'],
        as: 'friend'
      }]
    }
  ]
})
  .then(user => {
    if (!user) throw createError({
      status: NOT_FOUND,
      message: `No user found with id '${ userId }'`
    })

    return user
  })

const findResourceByName = resourceName => Resource.findOne({
  where: { name: resourceName }
})
  .then(resource => {
    if (!resource) throw createError({
      status: NOT_FOUND,
      message: `No resource found with name '${ resourceName }'`
    })

    return resource
  })

// POST /users
const postUsers = (req, res, next) => {
  const auth = req.cred.payload
  const canUpdatePermissions = isAuthorizedToWritePermissions(auth, req.app.get('app-name'))
  const permissions = req.body.permissions
  const props = User.filterProps(auth.isAdmin, req.body)

  User.create(props)
    .then(user => canUpdatePermissions ?
      user.updatePermissions(permissions) :
      user
    )
    .then(user => res.json({
      success: true,
      message: 'User created',
      user
    }))
    .catch(next)
}

// Create a new user that is guaranteed to not be an admin. This is to be used
// for public-facing signup/registration with the app.
// POST /registration
const postRegister = (req, res, next) => {
  const props = User.filterProps(false, req.body)

  User.create(props)
    .then(user => res.json({
      success: true,
      message: 'Registration successful',
      user
    }))
    .catch(next)
}

// Create a new facebook user storing a facebookId instead of username/password.
// POST /registration/facebook
const postRegisterFacebook = (req, res, next) => {

}

const getUsers = (req, res, next) => {
  User.findAll({
    include: [
      {
        model: Permission,
        include: [Resource]
      },
      {
        model: Friendship,
        include: [{
          model: User,
          attributes: ['id', 'username'],
          as: 'friend'
        }]
      }
    ]
  })
    .then(users => {
      const usersWithFriends = users.map(user => Object.assign({},
        user.toJSON(),
        {
          friendships: user.friendships.map(friendship => Object.assign({},
            friendship.toJSON(),
            {
              friend: Object.assign({}, {
                id: friendship.friend.id,
                username: friendship.friend.username
              })
            }
          ))
        }
      ))

      //console.log('users: ', usersWithFriends)

      return res.json({
        success: true,
        message: 'Users found',
        users: usersWithFriends
      })
    })
    .catch(next)
}

// GET /users/:id
const getUser = (req, res, next) => {
  const userId = req.params.id

  findUserById(userId)
    .then(user => res.json({
      success: true,
      message: 'User found',
      user
    }))
    .catch(next)
}

// PUT /users/:id
// Only allow updating of specific fields, check for their existence explicitly,
// and strip any html tags from String fields to mitigate XSS attacks.
const putUser = (req, res, next) => {
  const auth = req.cred.payload
  const canUpdatePermissions = isAuthorizedToWritePermissions(auth, req.app.get('app-name'))
  const userId = req.params.id
  const permissions = req.body.permissions
  const props = User.filterProps(auth.isAdmin, req.body)

  findUserById(userId)
    .then(user => user.update(props))
    .then(user => canUpdatePermissions ?
      user.updatePermissions(permissions) :
      user
    )
    .then(user => res.json({
      success: true,
      message: 'User updated',
      user
    }))
    .catch(next)
}

// DELETE /users/:id
// TODO: Should also remove corresponding permissions objects.
const deleteUser = (req, res, next) => {
  const userId = req.params.id

  findUserById(userId)
    .then(user => user.destroy())
    .then(() => res.json({
      success: true,
      message: 'User deleted'
    }))
    .catch(next)
}

// GET /users/:id/permissions/:resource_name
const getPermissions = (req, res, next) => {
  const userId = req.params.id
  const resourceName = req.params.resource_name

  findUserById(userId)
    .then(user => user.toJSON())
    .then(user => {
      if (!user.permissions[resourceName]) throw createError({
        status: UNPROCESSABLE,
        message: `User has no permissions set for resource '${ resourceName }'`
      })

      const actions = user.permissions &&
          user.permissions[resourceName] &&
          user.permissions[resourceName].actions ?
        user.permissions[resourceName].actions :
        []

      res.json({
        success: true,
        message: 'Permissions found',
        actions
      })
    })
    .catch(next)
}

// POST /users/:id/permissions/:resource_name
const postPermissions = (req, res, next) => {
  const userId = req.params.id
  const resourceName = req.params.resource_name
  const actions = req.body.actions

  if (!actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions provided'
  }))

  Promise.all([
    findUserById(userId),
    findResourceByName(resourceName)
  ])
    .then(userAndResource => {
      const user = userAndResource[0]
      const resource = userAndResource[1]

      return user.updatePermission(resource, actions)
    })
    .then(permission => res.json({
      success: true,
      message: 'Permission saved',
      actions: permission.actions
    }))
    .catch(next)
}

// DELETE /users/:id/permissions/:resource_name
// If user does not have a permission for resource, fail silently (if the
// request was to remove it and it's already non-existent, then that's basically
// a "successful" removal).
const deletePermissions = (req, res, next) => {
  const userId = req.params.id
  const resourceName = req.params.resource_name

  findUserById(userId)
    .then(user => {
      const userJson = user.toJSON()

      if (!userJson.permissions || !userJson.permissions[resourceName]) return

      return user.deletePermission(resourceName)
    })
    .then(permission => res.json({
      success: true,
      message: 'Permissions removed'
    }))
    .catch(next)
}

module.exports = {
  postUsers,
  postRegister,
  getUsers,
  getUser,
  putUser,
  deleteUser,
  getPermissions,
  postPermissions,
  deletePermissions
}
