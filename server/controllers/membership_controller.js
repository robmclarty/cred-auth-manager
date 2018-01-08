'use strict'

const { User, Group, Membership } = require('../models')
const {
  createError,
  BAD_REQUEST,
  NOT_FOUND
} = require('../helpers/error_helper')

const findMembershipByGroupId = id => Membership.findOne({
  where: { groupId: id }
}).then(membership => {
  if (!membership) throw createError({
    status: NOT_FOUND,
    message: `No membership found with id '${ id }'`
  })

  return membership
})

// POST /users/:user_id/groups/:group_id/contacts
// POST /groups/:group_id/users
// Takes an array of user IDs in the body and creates associations between those
// users and the group (i.e., it create "memberships" for that group).
const postMemberships = (req, res, next) => {
  const memberIds = req.body.contact_ids || []

  Group.findById(req.params.group_id)
    .then(group => {
      if (!group) throw createError({
        status: BAD_REQUEST,
        message: `No group found with id '${ req.params.group_id }'`
      })

      return Promise.all(memberIds.map(memberId => Membership.create({
        userId: memberId,
        groupId: group.id
      })))
    })
    .then(memberships => res.json({
      ok: true,
      message: 'Group memberships created',
      memberships
    }))
    .catch(next)
}

// DELETE /users/:user_id/groups/:group_id/contacts/:contact_id
// DELETE /groups/:group_id/users/:user_id
// Takes the user ID from the parameters and removes its membership from the group.
const deleteMembership = (req, res, next) => {
  // This is simply to determine which route is being used to call this function.
  // The old API uses `contact_id` whereas the new one uses `user_id`.
  const userId = req.params.contact_id ?
    req.params.contact_id :
    req.params.user_id
  const groupId = req.params.group_id

  Membership.findOne({
    where: {
      userId,
      groupId
    }
  })
    .then(membership => membership.destroy())
    .then(() => res.json({
      ok: true,
      message: 'Group membership destroyed',
      userId,
      groupId
    }))
    .catch(next)
}

module.exports = {
  postMemberships,
  deleteMembership
}
