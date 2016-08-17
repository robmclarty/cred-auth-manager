'use strict'

const router = require('express').Router()
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
const {
  requireReadUser,
  requireWriteUser,
  requireOwnerOrReadUser,
  requireOwnerOrWriteUser,
  requireReadPermission,
  requireWritePermission,
  requireOwnerOrReadPermission
} = require('../middleware/user_permission_middleware')

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
