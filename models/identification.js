'use strict';

module.exports = function(sequelize, Sequelize) {
  const Identification = sequelize.define('identification', {
    // Model attributes are defined here
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.BIGINT,
    },
    identification_card_1: {
      type: Sequelize.STRING,
      allowNull: true
    },
    identification_card_2: {
      type: Sequelize.STRING
  
    },
    driving_license_1: {
      type: Sequelize.STRING,
      allowNull: true
    },
    driving_license_2: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    score: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    deleted_at: {
      allowNull: true,
      type: Sequelize.DATE, 
    }
  }, {paranoid: true,  underscored: true});
  
  return Identification
  }