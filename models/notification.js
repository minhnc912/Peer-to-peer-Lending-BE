'use strict';

module.exports = function(sequelize, Sequelize) {
const Notification = sequelize.define('notifications', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  type_noti: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  content:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  type_account: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  invest_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  borrow_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  has_read: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE
  }
}, {paranoid: true, underscored: true});

return Notification
}