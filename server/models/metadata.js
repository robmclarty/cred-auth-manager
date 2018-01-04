'use strict'

const toJSON = metadata => ({
  id: metadata.id,
  userId: metadata.userId,
  name: metadata.key,
  value: metadata.value,
  createdAt: metadata.createdAt,
  updatedAt: metadata.updatedAt
})

// A join table between Users and Groups (i.e., a User is a member of a Group).
const MetadataSchema = function (sequelize, DataTypes) {
  const Metadata = sequelize.define('Metadata', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    name: {
      singular: 'metadata',
      plural: 'metadatas'
    },
    tableName: 'Metadatas',
    classMethods: {
      associate: models => {
        Metadata.belongsTo(models.User, { foreignKey: 'userId' })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return toJSON(this.get())
      }
    }
  })

  return Metadata
}

module.exports = MetadataSchema
