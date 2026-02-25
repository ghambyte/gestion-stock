const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Paiement = sequelize.define('Paiement', {
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
    boutiqueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'boutiques', key: 'id' },
    },
    echeanceId: {
      type: DataTypes.INTEGER,
      references: { model: 'echeances', key: 'id' },
    },
    montant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    modePaiement: {
      type: DataTypes.ENUM('especes', 'mobile_money', 'virement', 'autre'),
      defaultValue: 'especes',
    },
    notes: {
      type: DataTypes.TEXT,
    },
    datePaiement: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'paiements',
    updatedAt: false,
  });

  return Paiement;
};
