'use strict';

module.exports = function(sequelize, Sequelize) {
const InvestmentRequest = sequelize.define('investment_requests', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER
  },
  amount: {
    type: Sequelize.FLOAT
  },
  discount: {
    type: Sequelize.FLOAT
  },
  actually_recieved: {
    type: Sequelize.FLOAT
  },
  interest: {
    type: Sequelize.FLOAT
  },
  status:{
    type: Sequelize.INTEGER
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE
  }
}, {paranoid: true, underscored: true});

return InvestmentRequest
}