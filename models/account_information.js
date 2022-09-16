

'use strict';
const { ACCOUNT_STATUS } = require("../constant");

module.exports = function(sequelize, Sequelize) {
const AccountInformation = sequelize.define('account_informations', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.BIGINT,
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  balance: {
    type: Sequelize.FLOAT
  },
  card_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return AccountInformation
}