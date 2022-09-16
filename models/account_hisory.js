'use strict';
module.exports = function(sequelize, Sequelize) {
const AccountHistory = sequelize.define('account_histories', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  account_id: {
    type: Sequelize.BIGINT,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: true
  },
  amount: {
    type: Sequelize.FLOAT
  },
  sender_name: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  reciever_name: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  method: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  type :{
    type: Sequelize.INTEGER,
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

return AccountHistory
}