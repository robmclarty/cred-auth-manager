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

const createMetadata = (userId, name) => Metadata.create({
  userId,
  name
}, {
  include: [User]
})

const getMetadatas = (req, res, next) => {
  Metadata.findAll({
    include: [{
      model: User,
      as: 'members',
      attributes: ['id']
    }]
  })
    .then(metadatas => res.json({
      ok: true,
      message: 'Metadatas found',
      metadatas
    }))
    .catch(next)
}

// POST /users/:user_id/metadatas
// TODO: postMetadatas takes a param called `metadata_contacts` but putMetadata takes a
// param called `contact_ids`. This should be made consistent.
const postMetadatas = (req, res, next) => {
  const requestedMemberIds = req.body.metadata_contacts || []
  const userId = Number(req.body.userId)
  const metadataName = req.body.name

  createMetadata(userId, metadataName)
    .then(metadata => Promise.all([
      metadata,
      Membership.bulkCreate(requestedMemberIds.map(userId => ({
        userId: Number(userId),
        metadataId: metadata.id
      })))
    ]))
    .then(([metadata, memberships]) => res.json({
      ok: true,
      message: 'Metadata created',
      metadata: Object.assign({}, metadata.toJSON(), {
        contacts: memberships.map(m => String(m.userId))
      })
    }))
    .catch(next)
}

// GET /metadatas/:metadata_id
const getMetadata = (req, res, next) => {
  const metadataId = Number(req.params.metadata_id)

  findMetadataById(metadataId)
    .then(metadata => res.json({
      ok: true,
      message: 'Metadata found',
      metadata
    }))
    .catch(next)
}

// Filter two arrays:
// 1) Memberships which need to be deleted.
// 2) userIds which need new Memberships to be created for this Metadata.
// e.g.,
// currentMemberIds = [1, 2, 3, 4]
// requestedMemberIds = [2, 3, 5, 6]
// newMemberIds = [5, 6]
// droppedMemberIds = [1]
// unchanged membership ids (will be kept and left alone) = [2, 3]
//
// REFACTOR: This is way too complicated! Use Sequelize relationships rather
// than manually updating the join table directly.
// PUT /metadatas/:metadata_id
const putMetadata = (req, res, next) => {
  const requestedMemberIds = req.body.contact_ids || []
  const metadataId = Number(req.params.metadata_id)
  const metadataName = req.body.metadata_name

  findMetadataById(metadataId)
    .then(metadata => !metadataName ? metadata : metadata.update({ name: metadataName }))
    .then(metadata => Promise.all([
      metadata,
      Membership.findAll({ where: { metadataId: metadata.id } })
    ]))
    .then(([metadata, memberships]) => {
      const currentMemberIds = memberships.map(m => m.userId)
      const newMemberIds = requestedMemberIds.filter(userId => {
        return !currentMemberIds.includes(userId)
      })
      const droppedMemberIds = currentMemberIds.filter(userId => {
        return !requestedMemberIds.includes(userId)
      })

      return Promise.all([
        metadata,
        Membership.destroy({ where: { userId: droppedMemberIds } }),
        Membership.bulkCreate(newMemberIds.map(userId => ({
          userId: Number(userId),
          metadataId: metadata.id
        })))
      ])
    })
    .then(([metadata, ...rest]) => res.json({
      ok: true,
      message: 'Metadata updated',
      metadata
    }))
    .catch(next)
}

// DELETE /metadatas/:metadata_id
const deleteMetadata = (req, res, next) => {
  const metadataId = Number(req.params.metadata_id)

  findMetadataById(metadataId)
    .then(metadata => metadata.destroy())
    .then(() => res.json({
      ok: true,
      message: 'Metadata deleted'
    }))
    .catch(next)
}

// GET /users/:user_id/metadatas
const getUserMetadatas = (req, res, next) => {
  const userId = Number(req.params.user_id)

  User.findById(userId, {
    include: [{
      model: Metadata,
      include: [{
        model: User,
        as: 'members',
        attributes: ['id']
      }]
    }]
  })
    .then(user => {
      if (!user) throw createError({
        status: NOT_FOUND,
        message: `No user found with id '${ id }'`
      })

      return user
    })
    .then(user => res.json({
      ok: true,
      message: 'Metadatas found',
      metadatas: user.metadatas
    }))
    .catch(next)
}

// POST /users/:user_id/metadatas
// Creates a new metadata for this user and immediately adds a list of members
// based on the user IDs listed in `contact_ids` in the body of the req.
// TODO: rename `metadata_contacts` in body of request to be consistent with other functions.
const postUserMetadatas = (req, res, next) => {
  const newMemberIds = req.body.metadata_contacts || []
  const userId = Number(req.params.user_id)
  const metadataName = req.body.metadata_name

  User.findById(userId)
    .then(user => {
      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user with id '${ userId }'`
      })

      return createMetadata(userId, metadataName)
    })
    .then(metadata => Promise.all([
      metadata,
      Membership.bulkCreate(newMemberIds.map(userId => ({
        userId: Number(userId),
        metadataId: metadata.id
      })))
    ]))
    .then(([metadata, memberships]) => res.json({
      ok: true,
      message: 'Metadata created',
      metadata: Object.assign({}, metadata.toJSON(), {
        contacts: memberships.map(m => String(m.userId))
      })
    }))
    .catch(next)
}

module.exports = {
  getMetadatas,
  postMetadatas,
  getMetadata,
  putMetadata,
  deleteMetadata,
  getUserMetadatas,
  postUserMetadatas
}
