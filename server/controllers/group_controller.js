'use strict'

const { User, Group, Membership } = require('../models')
const {
  createError,
  BAD_REQUEST,
  NOT_FOUND
} = require('../helpers/error_helper')

const findGroupById = id => Group.findById(id, {
  include: [{
    model: User,
    as: 'members',
    attributes: ['id']
  }]
})
  .then(group => {
    if (!group) throw createError({
      status: NOT_FOUND,
      message: `No group found with id '${ id }'`
    })

    return group
  })

const createGroup = (userId, name) => Group.create({
  userId,
  name
}, {
  include: [User]
})

const getGroups = (req, res, next) => {
  Group.findAll({
    include: [{
      model: User,
      as: 'members',
      attributes: ['id']
    }]
  })
    .then(groups => res.json({
      ok: true,
      message: 'Groups found',
      groups
    }))
    .catch(next)
}

// POST /users/:user_id/groups
// TODO: postGroups takes a param called `group_contacts` but putGroup takes a
// param called `contact_ids`. This should be made consistent.
const postGroups = (req, res, next) => {
  const requestedMemberIds = req.body.group_contacts || []
  const userId = req.body.userId
  const groupName = req.body.name

  createGroup(userId, groupName)
    .then(group => Promise.all([
      group,
      Membership.bulkCreate(requestedMemberIds.map(userId => ({
        userId,
        groupId: group.id
      })))
    ]))
    .then(([group, memberships]) => res.json({
      ok: true,
      message: 'Group created',
      group: Object.assign({}, group.toJSON(), {
        contacts: memberships.map(m => m.userId)
      })
    }))
    .catch(next)
}

// GET /groups/:group_id
const getGroup = (req, res, next) => {
  const groupId = req.params.group_id

  findGroupById(groupId)
    .then(group => res.json({
      ok: true,
      message: 'Group found',
      group
    }))
    .catch(next)
}

// Filter two arrays:
// 1) Memberships which need to be deleted.
// 2) userIds which need new Memberships to be created for this Group.
// e.g.,
// currentMemberIds = [1, 2, 3, 4]
// requestedMemberIds = [2, 3, 5, 6]
// newMemberIds = [5, 6]
// droppedMemberIds = [1]
// unchanged membership ids (will be kept and left alone) = [2, 3]
//
// REFACTOR: This is way too complicated! Use Sequelize relationships rather
// than manually updating the join table directly.
// PUT /groups/:group_id
const putGroup = (req, res, next) => {
  const requestedMemberIds = req.body.contact_ids || []
  const groupId = req.params.group_id
  const groupName = req.body.group_name

  findGroupById(groupId)
    .then(group => !groupName ? group : group.update({ name: groupName }))
    .then(group => Promise.all([
      group,
      Membership.findAll({ where: { groupId: group.id } })
    ]))
    .then(([group, memberships]) => {
      const currentMemberIds = memberships.map(m => m.userId)
      const newMemberIds = requestedMemberIds.filter(userId => {
        return !currentMemberIds.includes(userId)
      })
      const droppedMemberIds = currentMemberIds.filter(userId => {
        return !requestedMemberIds.includes(userId)
      })

      return Promise.all([
        group,
        Membership.destroy({ where: { userId: droppedMemberIds } }),
        Membership.bulkCreate(newMemberIds.map(userId => ({
          userId,
          groupId: group.id
        })))
      ])
    })
    .then(([group, ...rest]) => res.json({
      ok: true,
      message: 'Group updated',
      group
    }))
    .catch(next)
}

// DELETE /groups/:group_id
const deleteGroup = (req, res, next) => {
  const groupId = req.params.group_id

  findGroupById(groupId)
    .then(group => group.destroy())
    .then(() => res.json({
      ok: true,
      message: 'Group deleted'
    }))
    .catch(next)
}

// GET /users/:user_id/groups
const getUserGroups = (req, res, next) => {
  const userId = req.params.user_id

  User.findById(userId, {
    include: [{
      model: Group,
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
      message: 'Groups found',
      groups: user.groups
    }))
    .catch(next)
}

// POST /users/:user_id/groups
// Creates a new group for this user and immediately adds a list of members
// based on the user IDs listed in `contact_ids` in the body of the req.
// TODO: rename `group_contacts` in body of request to be consistent with other functions.
const postUserGroups = (req, res, next) => {
  const newMemberIds = req.body.group_contacts || []
  const userId = req.params.user_id
  const groupName = req.body.group_name

  User.findById(userId)
    .then(user => {
      if (!user) throw createError({
        status: BAD_REQUEST,
        message: `No user with id '${ userId }'`
      })

      return createGroup(userId, groupName)
    })
    .then(group => Promise.all([
      group,
      Membership.bulkCreate(newMemberIds.map(userId => ({
        userId,
        groupId: group.id
      })))
    ]))
    .then(([group, memberships]) => res.json({
      ok: true,
      message: 'Group created',
      group: Object.assign({}, group.toJSON(), {
        contacts: memberships.map(m => m.userId)
      })
    }))
    .catch(next)
}

module.exports = {
  getGroups,
  postGroups,
  getGroup,
  putGroup,
  deleteGroup,
  getUserGroups,
  postUserGroups
}
