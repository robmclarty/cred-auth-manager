'use strict'

const { createError, BAD_REQUEST, UNPROCESSABLE, NOT_FOUND } = require('../helpers/error_helper')
const { User, Resource, Permission } = require('../models')

const findUserById = userId => User.findById(userId, {
  include: [{
    model: Permission,
    include: [Resource]
  }]
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

const updatePermission = (user, resource, actions) => {
  const validActions = resource.validActions(actions)

  // If the user already has existing permission for this resource, update
  // the existing permission with the new actions (the valid ones).
  if (user.permissions && user.permissions[resource.name]) {
    return Permission.findById(user.permissions[resource.name].id)
      .then(permission => {
        if (!permission) throw createError({
          status: UNPROCESSABLE,
          message: `User '${ user.id }' has no matching permission for resource '${ resource.name }'`
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
}

// Update all `permissions` for user (either by modifying existing permissions
// or creating new ones). Cycle through each resource in `permissions` and
// update the permission for that resource for `user`. Finally, if successful,
// return a newly loaded version of the user which should include the newly
// created/modified permissions associations.
const updatePermissions = (user, permissions) => {
  if (!permissions || permissions.length === 0) return user

  return Resource.findAll()
    .then(resources => resources.reduce((updatedPermissions, resource) => {
      if (permissions[resource.name] && permissions[resource.name].actions) {
        return [
          ...updatedPermissions,
          updatePermission(user, resource, permissions[resource.name].actions)
        ]
      }
    }, []))
    .then(updatePermissionPromises => Promise.all(updatePermissionPromises))
    .then(permissions => User.findById(user.id))
}

// Find the matching permission and destroy it.
const removePermission = (user, resourceName) => {
  return Permission.findById(user.permissions[resourceName].id)
    .then(permission => {
      if (!permission) throw createError({
        status: UNPROCESSABLE,
        message: `User '${ user.id }' has no matching permission for resource '${ resourceName }'`
      })

      return permission.destroy()
    })
}

// POST /users
const postUsers = (req, res, next) => {
  const auth = req.cred.payload
  const permissions = req.body.permissions
  const props = User.filterProps(auth.isAdmin, req.body)

  User.create(props)
    // TODO: then update permissions (if they were included in request)
    // NOTE: need to be able to return *full* user, including new permissions
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
  const permissions = req.body.permissions
  const props = User.filterProps(auth.isAdmin, req.body)

  findUserById(userId)
    .then(user => user.update(props))
    .then(user => updatePermissions(user, permissions))
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
      const user = userAndResource[0].toJSON()
      const resource = userAndResource[1]

      return updatePermission(user, resource, actions)
    })
    .then(permission => res.json({
      success: true,
      message: 'Permission saved',
      actions: permission.actions
    }))
    .catch(next)
}

// DELETE /users/:id/permissions/:resource_name
const deletePermissions = (req, res, next) => {
  const userId = req.params.id
  const resourceName = req.params.resource_name

  findUserById(userId)
    .then(rawUser => {
      const user = rawUser.toJSON()

      // If user does not have a permission for resource, fail silently (if the
      // request was to remove it and it's already non-existent, then that's
      // basically a "successful" removal).
      if (!user.permissions || !user.permissions[resourceName]) return

      return removePermission(user, resourceName)
    })
    .then(permission => res.json({
      success: true,
      message: 'Permissions removed'
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
