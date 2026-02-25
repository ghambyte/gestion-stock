const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MouvementStock = sequelize.define('MouvementStock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'produits', key: 'id' },
    },
    boutiqueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'boutiques', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('entree', 'sortie', 'ajustement'),
      allowNull: false,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantiteAvant: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantiteApres: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motif: {
      type: DataTypes.STRING(255),
    },
    referenceId: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'mouvements_stock',
    updatedAt: false,
  });

  return MouvementStock;
};
