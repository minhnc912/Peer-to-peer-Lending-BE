'use strict';
const { ACCOUNT_STATUS } = require("../constant");

module.exports = function(sequelize, Sequelize) {
const Account = sequelize.define('accounts', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  google_id: {
    type: Sequelize.STRING,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  last_name: {
    type: Sequelize.STRING

  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  avatar_url: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  },
  phone_number: {
    type: Sequelize.STRING,
    allowNull: true
  },
  limit_money: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  birth: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },
  gender: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  adress: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  identification_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  credit_score: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  everage_rating: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  is_verify_phone: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  is_super_user: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  status: {
    type: Sequelize.INTEGER,
    defaultValue : ACCOUNT_STATUS.LIVE
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true, timestamps: true});

return Account
}