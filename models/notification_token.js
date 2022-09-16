'use strict';

module.exports = function(sequelize, Sequelize) {
const notificationToken = sequelize.define('notification_tokens', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  token: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE
  }
}, {paranoid: true, underscored: true});

return notificationToken
}