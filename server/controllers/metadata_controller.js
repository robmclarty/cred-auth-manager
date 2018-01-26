'use strict'

const { User, Metadata } = require('../models')
const {
  createError,
  BAD_REQUEST,
  NOT_FOUND
} = require('../helpers/error_helper')

const findMetadataById = id => Metadata.findById(id, {
  include: [{
    model: User,
    as: 'members',
    attributes: ['id']
  }]
})
  .then(metadata => {
    if (!metadata) throw createError({
      status: NOT_FOUND,
      message: `No metadata found with id '${ id }'`
    })

    return metadata
  })

const createMetadata = (userId, name, value) => Metadata.create({
  userId,
  name,
  value
}, {
  include: [User]
})

const findUserById = id => User.findById(id, { include: [Metadata] })
  .then(user => {
    if (!user) throw createError({
      status: NOT_FOUND,
      message: `No user found with id '${ id }'`
    })

    return user
  })

const listMetadata = (req, res, next) => {
}

const postMetadata = (req, res, next) => {
}

const getMetadata = (req, res, next) => {
}

const putMetadata = (req, res, next) => {
}

const deleteMetadata = (req, res, next) => {
}


module.exports = {
  listMetadata,
  postMeta
}
