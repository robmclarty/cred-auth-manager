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

// Only admins can create new users and list all users.
router.route('/users')
  .post(requireWriteUser, postUsers)
  .get(requireReadUser, getUsers)

// Users can only get and change data for themselves, not any other users.
router.route('/users/:id')
  .get(requireReadUser, getUser)
  .put(requireWriteUser, putUser)
  .delete(requireWriteUser, deleteUser)

// Only users with the 'admin' action set for the given resource can change a
// user's permissions for that resource.
router.route('/users/:id/permissions/:resource_name')
  .post(requireWritePermission, postPermissions)
  .get(requireReadPermission, getPermissions)
  .delete(requireWritePermission, deletePermissions)

module.exports = router
