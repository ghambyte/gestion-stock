const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Echeance = sequelize.define('Echeance', {
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
    numeroEcheance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    dateEcheance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM('payee', 'en_attente', 'en_retard'),
      defaultValue: 'en_attente',
    },
    datePaiement: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'echeances',
  });

  return Echeance;
};
