'use strict';

module.exports = function(sequelize, Sequelize) {
const lendingCategory = sequelize.define('lending_categories', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  lending_request_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE
  }
}, {paranoid: true, underscored: true});

return lendingCategory
}