'use strict'

const {
  createError,
  BAD_REQUEST,
  NOT_FOUND
} = require('../helpers/error_helper')

const findMetadataById = (models, id) => models.Metadata.findById(id, {
  include: [{
    model: models.User,
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

const createMetadata = (models, userId, name, value) => models.Metadata.create({
  userId,
  name,
  value
}, {
  include: [models.User]
})

const findUserById = (models, id) => models.User.findById(id, {
  include: [models.Metadata]
})
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
