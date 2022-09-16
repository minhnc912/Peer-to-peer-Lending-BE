'use strict';

module.exports = function(sequelize, Sequelize) {
const AdminSetting = sequelize.define('admin_setting', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: Sequelize.INTEGER,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  value: {
    type: Sequelize.STRING
  },
  is_active: {
    allowNull: true,
    type: Sequelize.BOOLEAN, 
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return AdminSetting
}