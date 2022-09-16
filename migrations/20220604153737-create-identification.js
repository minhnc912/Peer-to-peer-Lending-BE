'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('identifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      identification_card_1: {
        type: Sequelize.STRING
      },
      identification_card_2: {
        type: Sequelize.STRING
      },
      driving_license_1: {
        type: Sequelize.STRING
      },
      driving_license_2: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.FLOAT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('identifications');
  }
};