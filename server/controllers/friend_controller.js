'use strict'

const {
  createError,
  BAD_REQUEST,
  CONFLICT,
  NOT_FOUND
} = require('../helpers/error_helper')
const {
  REQUESTED,
  PENDING,
  ACCEPTED,
  DECLINED,
  REJECTED,
  BANNED
} = require('../constants/friendship_status')
const { Friendship, User, Metadata } = require('../models')

const postFriends = (req, res, next) => {
}

const getFriends = (req, res, next) => {
}

const getFriend = (req, res, next) => {
}

const putFriend = (req, res, next) => {
}

const deleteFriend = (req, res, next) => {
}

const getPendingFriends = (req, res, next) => {
}

const updateFriendStatus = (req, res, next) => {
}

module.exports = {
  postFriends,
  getFriends,
  getFriend,
  putFriend,
  deleteFriend,
  getPendingFriends,
  updateFriendStatus
}
