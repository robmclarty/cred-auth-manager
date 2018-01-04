'use strict'

const toJSON = membership => ({
  id: String(membership.id),
  userId: String(membership.userId),
  groupId: String(membership.groupId),
  createdAt: membership.createdAt,
  updatedAt: membership.updatedAt
})

// A join table between Users and Groups (i.e., a User is a member of a Group).
const MembershipSchema = function (sequelize, DataTypes) {
  const Membership = sequelize.define('Membership', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Groups',
        key: 'id'
      }
    }
  },
  {
    name: {
      singular: 'membership',
      plural: 'memberships'
    },
    tableName: 'Memberships',
    classMethods: {
      associate: models => {
        Membership.belongsTo(models.User, { foreignKey: 'userId' })
        Membership.belongsTo(models.Group, { foreignKey: 'groupId' })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return toJSON(this.get())
      }
    }
  })

  return Membership
}

module.exports = MembershipSchema
