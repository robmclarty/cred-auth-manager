'use strict'

const express = require('express')
const router = express.Router()
const { requireOwner } = require('../middleware/basic_permissions')
const {
  postMemberships,
  deleteMembership
} = require('../controllers/membership_controller')

router.route('/groups/:group_id/users')
  .post(requireOwner, postMemberships)

router.route('/groups/:group_id/users/:user_id')
  .delete(requireOwner, deleteMembership)

module.exports = router
