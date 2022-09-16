'use strict';

module.exports = function(sequelize, Sequelize) {
const AccountPayment = sequelize.define('account_payments', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: Sequelize.BIGINT,
  },
  account_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  amount: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  vnpay_code_response: {
    type: Sequelize.STRING,
    allowNull: true
  },
  code_bank: {
    type: Sequelize.STRING,
    allowNull: true
  },
  note: {
    type: Sequelize.STRING,
    allowNull: true
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return AccountPayment
}