'use strict';

module.exports = function(sequelize, Sequelize) {
const LendingRequest = sequelize.define('lending_requests', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  long_id: {
    type: Sequelize.STRING,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  type_of_lending: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  max_number_of_investor: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  number_of_investor: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  available_money: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  amount_of_packet: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  minimum_money: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  total: {
    type: Sequelize.FLOAT,
    allowNull: true
  },  
  minimum_money: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  minimum_money_for_start: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  expected_money: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  total_payment: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  can_invest: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  interest_rate: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  start_date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  end_date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return LendingRequest
}