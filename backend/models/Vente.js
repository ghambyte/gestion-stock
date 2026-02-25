const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vente = sequelize.define('Vente', {
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
    clientId: {
      type: DataTypes.INTEGER,
      references: { model: 'clients', key: 'id' },
    },
    typeVente: {
      type: DataTypes.ENUM('comptant', 'echeance'),
      allowNull: false,
    },
    montantTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    montantPaye: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    montantRestant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    statut: {
      type: DataTypes.ENUM('completee', 'en_cours', 'annulee'),
      defaultValue: 'en_cours',
    },
    nombreEcheances: {
      type: DataTypes.INTEGER,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    dateVente: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'ventes',
  });

  return Vente;
};
