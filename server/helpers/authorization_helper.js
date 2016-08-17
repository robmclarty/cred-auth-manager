'use strict'

const isAdmin = req =>
  req.cred &&
  req.cred.payload &&
  req.cred.payload.isAdmin

const isOwner = req =>
  req.cred &&
  req.cred.payload &&
  req.cred.payload.userId &&
  req.params &&
  req.params.id &&
  Number(req.cred.payload.userId) === Number(req.params.id)

module.exports = {
  isAdmin,
  isOwner
}
