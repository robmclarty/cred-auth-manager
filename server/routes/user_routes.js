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

const requireReadUser = cred.requirePermission('users:read')
const requireWriteUser = cred.requirePermission('users:write')
const requireReadPermission = cred.requirePermission([
  'permissions:read',
  'users:read'
])
const requireWritePermission = cred.requirePermission([
  'permission:write',
  'users:write'
])

// A user should be able to see themselves, even if they have no other perms.
const requireOwnerOrReadUser = (req, res, next) => req.cred &&
    req.cred.payload &&
    req.cred.payload.userId === Number(req.params.id) ?
  next() :
  requireReadUser(req, res, next)

// A user should be able to modify themselves, even if they have no other perms.
const requireOwnerOrWriteUser = (req, res, next) => req.cred &&
    req.cred.payload &&
    req.cred.payload.userId === Number(req.params.id) ?
  next() :
  requireWriteUser(req, res, next)

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
  .get(requireReadPermission, getPermissions)
  .delete(requireWritePermission, deletePermissions)

module.exports = router
