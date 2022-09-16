'use strict';

module.exports = function(sequelize, Sequelize) {
  const InvestmentLendingRequest = sequelize.define('investment_lending_requests', {
    // Model attributes are defined here
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    investment_request_id: {
      type: Sequelize.INTEGER
    },
    lending_request_id: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.INTEGER
    },
    deleted_at: {
      allowNull: true,
      type: Sequelize.DATE
    }
  }, {paranoid: true,  underscored: true});
  
  return InvestmentLendingRequest
  }