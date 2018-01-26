'use strict'

const express = require('express')
const router = express.Router()
const { requireOwner, requireAdmin } = require('../middleware/basic_permissions')
const {
  getMetadatas,
  postMetadatas,
  getMetadata,
  putMetadata,
  deleteMetadata,
  getUserMetadatas,
  postUserMetadatas
} = require('../controllers/metadata_controller')

router.route('/users/:user_id/metadata')
  .all(requireOwner)
  .get(listMetadata)
  .post(postMetadata)

router.route('/users/:user_id/metadata/:metadata_id')
  .all(requireOwner)
  .get(getMetadata)
  .put(putMetadata)
  .delete(deleteMetadata)

module.exports = router
