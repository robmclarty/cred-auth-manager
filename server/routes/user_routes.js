'use strict'

const router = require('express').Router()
const cred = require('../cred')
const {
  postUsers,
  getUsers,
  getUser,
  putUser,
  deleteUser,
  getPermissions,
  postPermissions,
  deletePermissions
} = require('../controllers/user_controller')

const isAdmin = req =>
  req.cred &&
  req.cred.payload &&
  req.cred.payload.isAdmin

const isOwner = req =>
  req.cred &&
  req.cred.payload &&
  req.cred.payload.userId &&
  req.params &&
  req.params.id &&
  Number(req.cred.payload.userId) === Number(req.params.id)

const requireReadUserCred = cred.requirePermission('users:read')
const requireWriteUserCred = cred.requirePermission('users:write')
const requireReadPermissionCred = cred.requirePermission([
  'permissions:read',
  'users:read'
])
const requireWritePermissionCred = cred.requirePermission([
  'permissions:write',
  'users:write'
])

// Always allow admins, otherwise require permission 'users:read'.
const requireReadUser = (req, res, next) => isAdmin(req) ?
  next() :
  requireReadUserCred(req, res, next)

// Always allow admins, otherwise require permission 'users:write'.
const requireWriteUser = (req, res, next) => isAdmin(req) ?
  next() :
  requireWriteUserCred(req, res, next)

// A user should be able to see themselves, even if they have no other perms.
const requireOwnerOrReadUser = (req, res, next) => isOwner(req) ?
  next() :
  requireReadUser(req, res, next)

// A user should be able to modify themselves, even if they have no other perms.
const requireOwnerOrWriteUser = (req, res, next) => isOwner(req) ?
  next() :
  requireWriteUser(req, res, next)

// Always allow admins, otherwise require read permissions.
const requireReadPermission = (req, res, next) => isAdmin(req) ?
  next() :
  requireReadPermissionCred(req, res, next)

// Always allow admins, otherwise require write permissions.
const requireWritePermission = (req, res, next) => isAdmin(req) ?
  next() :
  requireWritePermissionCred(req, res, next)

// Users are allowed to read their own permissions, otherwise require 'users:read'.
const requireOwnerOrReadPermission = (req, res, next) => isOwner(req) ?
  next() :
  requireReadPermission(req, res, next)

// NOTE: There is no requireOwnerOrWritePermission() because users are not
// allowed to modify their own permissions.

// Only admins can create new users and list all users.
router.route('/users')
  .post(requireWriteUser, postUsers)
  .get(requireReadUser, getUsers)

// Users can only get and change data for themselves, not any other users.
router.route('/users/:id')
  .get(requireOwnerOrReadUser, getUser)
  .put(requireOwnerOrWriteUser, putUser)
  .delete(requireWriteUser, deleteUser)

// Only users with the 'admin' action set for the given resource can change a
// user's permissions for that resource.
router.route('/users/:id/permissions/:resource_name')
  .post(requireWritePermission, postPermissions)
  .get(requireOwnerOrReadPermission, getPermissions)
  .delete(requireWritePermission, deletePermissions)

module.exports = router
