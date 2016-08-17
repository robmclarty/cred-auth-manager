'use strict'

const cred = require('../cred')
const { isAdmin, isOwner } = require('../helpers/authorization_helper')

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

module.exports = {
  requireReadUser,
  requireWriteUser,
  requireOwnerOrReadUser,
  requireOwnerOrWriteUser,
  requireReadPermission,
  requireWritePermission,
  requireOwnerOrReadPermission
}
