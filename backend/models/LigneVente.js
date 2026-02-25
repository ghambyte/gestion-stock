const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LigneVente = sequelize.define('LigneVente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    venteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'ventes', key: 'id' },
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'produits', key: 'id' },
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prixUnitaire: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    montantLigne: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  }, {
    tableName: 'lignes_vente',
    updatedAt: false,
  });

  return LigneVente;
};
