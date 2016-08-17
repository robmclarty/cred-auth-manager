'use strict'

const cred = require('../cred')
const { isAdmin } = require('../helpers/authorization_helper')

const requireReadResourceCred = cred.requirePermission('resources:read')
const requireWriteResourceCred = cred.requirePermission('resources:write')

// If admin, pass through, otherwise require permission 'resources:read'.
const requireReadResource = (req, res, next) => isAdmin(req) ?
  next() :
  requireReadResourceCred(req, res, next)

// If admin, pass through, otherwise require permission 'resources:write'.
const requireWriteResource = (req, res, next) => isAdmin(req) ?
  next() :
  requireWriteResourceCred(req, res, next)

module.exports = {
  requireReadResource,
  requireWriteResource
}
