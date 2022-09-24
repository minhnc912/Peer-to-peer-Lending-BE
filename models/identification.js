'use strict';

module.exports = function(sequelize, Sequelize) {
  const Identification = sequelize.define('identifications', {
    // Model attributes are defined here
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.BIGINT,
    },
    identification_id: {
      type: Sequelize.STRING,
      allowNull: true
    },
    name: {
      type: Sequelize.STRING
    },
    birth: {
      type: Sequelize.DATE,
      allowNull: true
    },
    home: {
      type: Sequelize.STRING,
      allowNull: true
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true
    },
    type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    score:{
      type: Sequelize.FLOAT
    },
    img_front:{
      type: Sequelize.STRING,
      allowNull: true
    },
    img_back:{
      type: Sequelize.STRING,
      allowNull: true
    },
    deleted_at: {
      allowNull: true,
      type: Sequelize.DATE, 
    }
  }, {paranoid: true,  underscored: true});
  
  return Identification
  }