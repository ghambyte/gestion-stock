const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    boutiqueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'boutiques', key: 'id' },
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom du client est requis' },
      },
    },
    telephone: {
      type: DataTypes.STRING(20),
    },
    email: {
      type: DataTypes.STRING(255),
      validate: {
        isEmailOrEmpty(value) {
          if (value && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('Email invalide');
          }
        },
      },
      set(value) {
        this.setDataValue('email', value && value.trim() !== '' ? value : null);
      },
    },
    adresse: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'clients',
    paranoid: true,
  });

  return Client;
};
