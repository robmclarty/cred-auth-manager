'use strict'

const cred = require('../cred')
const { isAdmin, isOwner } = require('../helpers/authorization_helper')
const { createError, UNAUTHORIZED } = require('../helpers/error_helper')

const requireAdmin = (req, res, next) => isAdmin(req) ?
  next() :
  next(createError({
    status: UNAUTHORIZED,
    message: 'Admin permissions are required to access this resource.'
  }))

const requireOwner = (req, res, next) => isAdmin(req) || isOwner(req) ?
  next() :
  next(createError({
    status: UNAUTHORIZED,
    message: 'Only the resource\'s owner is permitted to access this resource.'
  }))

module.exports = {
  requireAdmin,
  requireOwner
}
