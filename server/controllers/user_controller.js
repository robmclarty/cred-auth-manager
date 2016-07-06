'use strict'

const striptags = require('striptags')
const { createError, BAD_REQUEST } = require('../helpers/error_helper')
const Resource = require('../models/resource')
const User = require('../models/user')
const cred = require('../cred')

// Given a user object, check for any corresponding attributes in the request
// body and update the user object with those properties that the auth object
// (from req.auth) is allowed to change.
// NOTE: permissions are updated through a special endpoint just for that.
const updatedUser = ({ auth = {}, targetUser = {}, updates = {} }) => {
  const user = Object.assign({}, targetUser)

  if (updates.hasOwnProperty('username')) user.username = striptags(updates.username)
  if (updates.hasOwnProperty('email')) user.email = striptags(updates.email)
  if (updates.hasOwnProperty('password')) user.password = updates.password

  // Only admins can activate or de-activate users.
  if (updates.hasOwnProperty('isActive') && auth.isAdmin) user.isActive = updates.isActive

  // Only other admins can assign admin status to users.
  if (updates.hasOwnProperty('isAdmin') && auth.isAdmin) user.isAdmin = updates.isAdmin

  return user
}

const postUsers = (req, res, next) => {
  const user = updatedUser({
    auth: req[cred.key].payload,
    targetUser: new User(),
    updates: req.body
  })

  user.save()
    .then(res.json({
      success: true,
      message: 'User created.',
      user: newUser
    }))
    .catch(next)
}

// Create a new user that is guaranteed to not be an admin. This is to be used
// for public-facing signup/registration with the app.
const postRegistration = (req, res, next) => {
  const user = updatedUser({
    auth: req[cred.key].payload,
    targetUser: new User(),
    updates: req.body
  })

  // Admin users cannot be created through this endpoint.
  newUser.isAdmin = false

  user.save()
    .then(res.json({
      success: true,
      message: 'Registration successful.',
      user: newUser
    }))
    .catch(next)
}

const getUsers = (req, res, next) => {
  User.find({})
    .then(users => res.json({
      success: true,
      message: 'Users found.',
      users
    }))
    .catch(next)
}

const getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user found with id '${ req.params.id }'`
      })

      res.json({
        success: true,
        message: 'User found.',
        user
      })
    })
    .catch(next)
}

// Only allow updating of specific fields, check for their existence explicitly,
// and strip any html tags from String fields to mitigate XSS attacks.
const putUser = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user found with id '${ req.params.id }'`
      })

      return updatedUser({
        auth: req[cred.key].payload,
        targetUser: user,
        updates: req.body
      })
    })
    .then(user => user.save())
    .then(user => res.json({
      success: true,
      message: 'User updated.',
      user
    }))
    .catch(next)
}

const deleteUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.id)
    .then(user => {
      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user found with id '${ req.params.id }'`
      })

      res.json({
        success: true,
        message: 'User deleted.',
        user
      })
    })
    .catch(next)
}

// GET /users/:id/permissions/:resource_name
const getPermissions = (req, res, next) => {
  Promise.all([
      User.findById(req.params.id),
      Resource.findOne({ name: req.params.resource_name })
    ])
    .then(userAndResource => {
      const user = userAndResource[0]
      const resource = userAndResource[1]

      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user found with id '${ req.params.id }'`
      })

      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with name '${ req.params.resource_name }'`
      })

      const permission = user.findPermission(resource.name)

      res.json({
        success: true,
        message: 'Permissions found.',
        actions: permission ? permission.actions : []
      })
    })
    .catch(next)
}

// POST /users/:id/permissions/:resource_name
const postPermissions = (req, res, next) => {
  // Don't go any further if no actions were provided.
  if (!req.body.actions) return next(createError({
    status: BAD_REQUEST,
    message: 'No actions provided.'
  }))

  Promise.all([
      User.findById(req.params.id),
      Resource.findOne({ name: req.params.resource_name })
    ])
    .then(userAndResource => {
      const user = userAndResource[0]
      const resource = userAndResource[1]

      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user found with id '${ req.params.id }'`
      })

      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with name '${ req.params.resource_name }'`
      })

      // Old permissions are replaced with new ones.
      user.setPermission({
        resource,
        actions: req.body.actions
      })

      return user.save()
    })
    .then(user => res.json({
      success: true,
      message: 'Permissions updated.',
      user
    }))
    .catch(next)
}

// DELETE /users/:id/permissions/:resource_name
const deletePermissions = (req, res, next) => {
  Promise.all([
      User.findById(req.params.id),
      Resource.findOne({ name: req.params.resource_name })
    ])
    .then(userAndResource => {
      const user = userAndResource[0]
      const resource = userAndResource[1]

      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user found with id '${ req.params.id }'`
      })

      if (!resource) throw createError({
        status: BAD_REQUEST,
        message: `No resource found with name '${ req.params.resource_name }'`
      })

      user.removePermission(resource.name)

      return user.save()
    })
    .then(user => res.json({
      success: true,
      message: 'Permissions deleted.',
      user
    }))
    .catch(next)
};

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
