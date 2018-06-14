'use strict'

const toJSON = metadata => ({
  id: metadata.id,
  userId: metadata.userId,
  name: metadata.name,
  value: metadata.value,
  createdAt: metadata.createdAt,
  updatedAt: metadata.updatedAt
})

// A join table between Users and Groups (i.e., a User is a member of a Group).
const MetadataSchema = function (sequelize, DataTypes) {
  const Metadata = sequelize.define('Metadata', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
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
      plural: 'metadata'
    },
    tableName: 'Metadata',
    classMethods: {
      associate: models => {
        Metadata.belongsTo(models.User, { foreignKey: 'userId' })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return toJSON(this.get())
      }
    },
    timestamps: false
  })

  return Metadata
}

module.exports = MetadataSchema
