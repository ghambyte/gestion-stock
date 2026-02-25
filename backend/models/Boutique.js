const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Boutique = sequelize.define('Boutique', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'utilisateurs', key: 'id' },
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom de la boutique est requis' },
      },
    },
    adresse: {
      type: DataTypes.STRING(255),
    },
    telephone: {
      type: DataTypes.STRING(20),
    },
    devise: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'FCFA',
    },
    statut: {
      type: DataTypes.ENUM('active', 'suspendue', 'en_attente'),
      defaultValue: 'active',
    },
    logo: {
      type: DataTypes.STRING(255),
    },
  }, {
    tableName: 'boutiques',
  });

  return Boutique;
};
