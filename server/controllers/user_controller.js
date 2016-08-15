'use strict'

const { createError, BAD_REQUEST, UNPROCESSABLE } = require('../helpers/error_helper')
const { User, Resource, Permission } = require('../models')

const findUserById = userId => User.findById(userId, {
  include: [{
    model: Permission,
    include: [Resource]
  }]
})
  .then(user => {
    if (!user) throw createError({
      status: BAD_REQUEST,
      message: `No user found with id '${ userId }'`
    })

    return user
  })

const findResourceByName = resourceName => Resource.findOne({
  where: { name: resourceName }
})
  .then(resource => {
    if (!resource) throw createError({
      status: BAD_REQUEST,
      message: `No resource found with name '${ resourceName }'`
    })

    return resource
  })

// POST /users
const postUsers = (req, res, next) => {
  const auth = req.cred.payload
  const props = User.filterProps(auth.isAdmin, req.body)

  User.create(props)
    .then(user => res.json({
      success: true,
      message: 'User created',
      user
    }))
    .catch(next)
}

// POST /registration
// Create a new user that is guaranteed to not be an admin. This is to be used
// for public-facing signup/registration with the app.
const postRegistration = (req, res, next) => {
  // const auth = req.cred.payload
  // const filteredUpdates = User.filterAdminProps(auth.isAdmin, req.body)
  // const user = new User(filteredUpdates)
  //
  // // Admin users cannot be created through this endpoint.
  // user.isAdmin = false
  //
  // user.save()
  //   .then(res.json({
  //     success: true,
  //     message: 'Registration successful.',
  //     user: newUser
  //   }))
  //   .catch(next)
}

const getUsers = (req, res, next) => {
  User.findAll({
    include: [{
      model: Permission,
      include: [Resource]
    }]
  })
    .then(users => res.json({
      success: true,
      message: 'Users found',
      users
    }))
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
  const userId = req.params.id

  findUserById(userId)
    .then(user => user.update(User.filterProps(auth.isAdmin, req.body)))
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
    .then(user => {
      if (!user.permissions.resourceName) throw createError({
        status: BAD_REQUEST,
        message: `User has no permissions set for resource '${ resourceName }'`
      })

      const actions = user.permissions &&
          user.permissions.resourceName &&
          user.permissions.resourceName.actions ?
        user.permissions.resourceName.actions :
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
      const validActions = resource.validActions(actions)

      // If the user already has existing permission for this resource, update
      // the existing permission with the new actions (the valid ones).
      if (user.permissions && user.permissions[resourceName]) {
        return Permission.findById(user.permissions[resourceName].id)
          .then(permission => {
            if (!permission) throw createError({
              status: UNPROCESSABLE,
              message: `Could not find matching permission for user '${ userId }' and resource '${ resourcename }'`
            })

            return permission.update({
              actions: validActions
            })
          })
      }

      // ...otherwise, create a new permission.
      return Permission.create({
        userId: user.id,
        resourceId: resource.id,
        actions: validActions
      })
    })
    .then(permission => res.json({
      success: true,
      message: 'Permission saved',
      permission
    }))
    .catch(next)
}

// DELETE /users/:id/permissions/:resource_name
const deletePermissions = (req, res, next) => {
  const userId = req.params.id
  const resourceName = req.params.resource_name

  Promise.all([
    findUserById(userId),
    findResourceByName(resourceName)
  ])
    .then(userAndResource => {
      const user = userAndResource[0]
      const resource = userAndResource[1]

      // If user does not have a permission for resource, fail silently (if the
      // request was to remove it and it's already non-existent, then that's
      // basically a "successful" removal).
      if (!user.permissions || !user.permissions[resourceName]) return

      // Find the matching permission and destroy it.
      return Permission.findById(user.permissions[resourceName].id)
        .then(permission => {
          if (!permission) throw createError({
            status: UNPROCESSABLE,
            message: `Could not find matching permission for user '${ userId }' and resource '${ resourcename }'`
          })

          return permission.destroy()
        })
    })
    .then(permission => res.json({
      success: true,
      message: 'Permission removed'
    }))
    .catch(next)
}

module.exports = {
  postUsers,
  postRegistration,
  getUsers,
  getUser,
  putUser,
  deleteUser,
  getPermissions,
  postPermissions,
  deletePermissions
}
