'use strict';
const { ACCOUNT_STATUS } = require("../constant");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      google_id: {
        type: Sequelize.BIGINT
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      birth: {
        type: Sequelize.DATEONLY
      },
      gender: {
        type: Sequelize.BOOLEAN
      },
      identification_id: {
        type: Sequelize.BIGINT
      },
      credit_score: {
        type: Sequelize.FLOAT
      },
      everage_rating: {
        type: Sequelize.FLOAT
      },
      is_super_user: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue : ACCOUNT_STATUS.LIVE
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
    await queryInterface.dropTable('accounts');
  }
};