'use strict';

module.exports = function(sequelize, Sequelize) {
const WithdrawRequest = sequelize.define('withdraw_requests', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  account_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  account_number: {
    type: Sequelize.STRING,
    allowNull: true
  },
  bank_code: {
    type: Sequelize.STRING,
    allowNull: true
  },
  amount: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return WithdrawRequest
}