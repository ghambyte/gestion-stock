const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Produit = sequelize.define('Produit', {
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
    categorieId: {
      type: DataTypes.INTEGER,
      references: { model: 'categories', key: 'id' },
    },
    nom: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom du produit est requis' },
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    prixAchat: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    prixVente: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    quantiteStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    seuilAlerte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    image: {
      type: DataTypes.STRING(255),
    },
    estActif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'produits',
    paranoid: true,
  });

  return Produit;
};
