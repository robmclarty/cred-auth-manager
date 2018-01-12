'use strict'

const PENDING = 'pending'
const REQUESTED = 'requested'
const ACCEPTED = 'accepted'
const DECLINED = 'declined'
const REJECTED = 'rejected'
const BANNED = 'banned'

const FRIENDSHIP_STATUSES = [
  PENDING,
  REQUESTED,
  ACCEPTED,
  DECLINED,
  REJECTED,
  BANNED
]

module.exports = {
  PENDING,
  REQUESTED,
  ACCEPTED,
  DECLINED,
  REJECTED,
  BANNED,
  FRIENDSHIP_STATUSES
}
