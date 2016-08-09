'use strict'

const { createError, BAD_REQUEST } = require('../helpers/error_helper')
//const Resource = require('../models/resource')
const { User, Resource, Permission } = require('../models')
//const models = require('../models')
//const cred = require('../cred')

// POST /users
const postUsers = (req, res, next) => {
  // const auth = req.cred.payload
  // const filteredUpdates = User.filterAdminProps(auth.isAdmin, req.body)
  // const user = new User(filteredUpdates)
  //
  // user.save()
  //   .then(res.json({
  //     success: true,
  //     message: 'User created.',
  //     user: newUser
  //   }))
  //   .catch(next)
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
      message: 'Users found.',
      users
    }))
    .catch(next)
}

// GET /users/:id
const getUser = (req, res, next) => {
  const userId = String(req.params.id)

  User.findById(userId, {
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

      res.json({
        success: true,
        message: 'User found.',
        user
      })
    })
    .catch(next)
}

// PUT /users/:id
// Only allow updating of specific fields, check for their existence explicitly,
// and strip any html tags from String fields to mitigate XSS attacks.
const putUser = (req, res, next) => {
  // const auth = req.cred.payload
  // const userId = String(req.params.id)
  //
  // User.findById(userId)
  //   .then(user => {
  //     if (!user) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No user found with id '${ userId }'`
  //     })
  //
  //     const filteredUpdates = User.filterAdminProps(auth.isAdmin, req.body)
  //
  //     Object.keys(filteredUpdates).forEach(key => {
  //       user[key] = filteredUpdates[key]
  //     })
  //
  //     return user.save()
  //   })
  //   .then(user => res.json({
  //     success: true,
  //     message: 'User updated.',
  //     user
  //   }))
  //   .catch(next)
}

// DELETE /users/:id
const deleteUser = (req, res, next) => {
  // const userId = String(req.params.id)
  //
  // User.findByIdAndRemove(userId)
  //   .then(user => {
  //     if (!user) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No user found with id '${ userId }'`
  //     })
  //
  //     res.json({
  //       success: true,
  //       message: 'User deleted.',
  //       user
  //     })
  //   })
  //   .catch(next)
}

// GET /users/:id/permissions/:resource_name
const getPermissions = (req, res, next) => {
  // const userId = String(req.params.id)
  // const resourceName = String(req.params.resource_name)
  //
  // Promise.all([
  //     User.findById(userId),
  //     Resource.findOne({ name: resourceName })
  //   ])
  //   .then(userAndResource => {
  //     const user = userAndResource[0]
  //     const resource = userAndResource[1]
  //
  //     if (!user) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No user found with id '${ userId }'`
  //     })
  //
  //     if (!resource) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No resource found with name '${ resourceName }'`
  //     })
  //
  //     const permission = user.findPermission(resource.name)
  //
  //     res.json({
  //       success: true,
  //       message: 'Permissions found.',
  //       actions: permission ? permission.actions : []
  //     })
  //   })
  //   .catch(next)
}

// POST /users/:id/permissions/:resource_name
const postPermissions = (req, res, next) => {
  // const userId = String(req.params.id)
  // const resourceName = String(req.params.resource_name)
  // const actions = req.body.actions
  //
  // // Don't go any further if no actions were provided.
  // if (!actions) return next(createError({
  //   status: BAD_REQUEST,
  //   message: 'No actions provided.'
  // }))
  //
  // Promise.all([
  //     User.findById(userId),
  //     Resource.findOne({ name: resourceName })
  //   ])
  //   .then(userAndResource => {
  //     const user = userAndResource[0]
  //     const resource = userAndResource[1]
  //
  //     if (!user) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No user found with id '${ userId }'`
  //     })
  //
  //     if (!resource) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No resource found with name '${ resourceName }'`
  //     })
  //
  //     // Old permissions are replaced with new ones.
  //     user.setPermission({
  //       resource,
  //       actions
  //     })
  //
  //     return user.save()
  //   })
  //   .then(user => res.json({
  //     success: true,
  //     message: 'Permissions updated.',
  //     user
  //   }))
  //   .catch(next)
}

// DELETE /users/:id/permissions/:resource_name
const deletePermissions = (req, res, next) => {
  // const userId = req.params.id
  // const resourceName = req.params.resource_name
  //
  // Promise.all([
  //     User.findById(userId),
  //     Resource.findOne({ name: resourceName })
  //   ])
  //   .then(userAndResource => {
  //     const user = userAndResource[0]
  //     const resource = userAndResource[1]
  //
  //     if (!user) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No user found with id '${ userId }'`
  //     })
  //
  //     if (!resource) throw createError({
  //       status: BAD_REQUEST,
  //       message: `No resource found with name '${ resourceName }'`
  //     })
  //
  //     user.removePermission(resource.name)
  //
  //     return user.save()
  //   })
  //   .then(user => res.json({
  //     success: true,
  //     message: 'Permissions deleted.',
  //     user
  //   }))
  //   .catch(next)
}

Object.assign(exports, {
  postUsers,
  postRegistration,
  getUsers,
  getUser,
  putUser,
  deleteUser,
  getPermissions,
  postPermissions,
  deletePermissions
})
