'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      resourceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Resource',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      resourceName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      actions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Permissions');
  }
};
