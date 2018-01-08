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

router.route('/metadatas')
  .all(requireAdmin)
  .get(getMetadatas)
  .post(postMetadatas)

router.route('/metadatas/:metadata_id')
  .all(requireOwner)
  .get(getMetadata)
  .put(putMetadata)
  .delete(deleteMetadata)

router.route('/users/:user_id/metadatas')
  .all(requireOwner)
  .get(getUserMetadatas)
  .post(postUserMetadatas)

router.route('/users/:user_id/metadatas/:metadata_id')
  .all(requireOwner)
  .get(getMetadata)
  .put(putMetadata)
  .delete(deleteMetadata)

module.exports = router
