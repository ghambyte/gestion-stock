const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Categorie = sequelize.define('Categorie', {
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
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom de la categorie est requis' },
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'categories',
    indexes: [
      {
        unique: true,
        fields: ['boutiqueId', 'nom'],
        name: 'unique_categorie_par_boutique',
      },
    ],
  });

  return Categorie;
};
