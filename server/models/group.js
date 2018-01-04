'use strict'

const toJSON = group => ({
  id: String(group.id),
  name: group.name,
  members: group.members ? group.members : []
})

const GroupSchema = function (sequelize, DataTypes) {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    name: {
      singular: 'group',
      plural: 'groups'
    },
    tableName: 'Groups',
    classMethods: {
      associate: models => {
        Group.belongsTo(models.User, {
          foreignKey: 'userId',
          onDelete: 'cascade'
        })
        Group.hasMany(models.Membership, { foreignKey: 'groupId' })
        Group.belongsToMany(models.User, {
          as: 'members',
          through: 'Membership',
          foreignKey: 'groupId'
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return toJSON(this.get())
      }
    }
  })

  return Group
}

module.exports = GroupSchema
