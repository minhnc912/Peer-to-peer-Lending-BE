'use strict';

module.exports = function(sequelize, Sequelize) {
const AccountOTP = sequelize.define('account_otps', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  user_id:{
    type: Sequelize.INTEGER,
    allowNull: true
  },
  invest_id:{
    type: Sequelize.INTEGER,
    allowNull: true
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return AccountOTP
}