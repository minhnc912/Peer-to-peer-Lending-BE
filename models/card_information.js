'use strict';

module.exports = function(sequelize, Sequelize) {
const CardInformation = sequelize.define('card_information', {
  // Model attributes are defined here
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  card_number: {
    type: Sequelize.STRING,
  },
  holder_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  date_range: {
    type: Sequelize.DATEONLY

  },
  deleted_at: {
    allowNull: true,
    type: Sequelize.DATE, 
  }
}, {paranoid: true, underscored: true});

return CardInformation
}