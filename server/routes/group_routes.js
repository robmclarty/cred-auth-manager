'use strict'

const express = require('express')
const router = express.Router()
const { requireOwner, requireAdmin } = require('../middleware/basic_permissions')
const {
  getGroups,
  postGroups,
  getGroup,
  putGroup,
  deleteGroup,
  getUserGroups,
  postUserGroups
} = require('../controllers/group_controller')

router.route('/groups')
  .all(requireAdmin)
  .get(getGroups)
  .post(postGroups)

router.route('/groups/:group_id')
  .all(requireOwner)
  .get(getGroup)
  .put(putGroup)
  .delete(deleteGroup)

router.route('/users/:user_id/groups')
  .all(requireOwner)
  .get(getUserGroups)
  .post(postUserGroups)

router.route('/users/:user_id/groups/:group_id')
  .all(requireOwner)
  .get(getGroup)
  .put(putGroup)
  .delete(deleteGroup)

module.exports = router
