const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom est requis' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Cet email est deja utilise' },
      validate: {
        isEmail: { msg: 'Email invalide' },
      },
    },
    motDePasse: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING(20),
      unique: { msg: 'Ce numero de telephone est deja utilise' },
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'vendeur'),
      allowNull: false,
      defaultValue: 'vendeur',
    },
    estActif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    derniereConnexion: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'utilisateurs',
    hooks: {
      beforeCreate: async (utilisateur) => {
        if (utilisateur.motDePasse) {
          utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, 10);
        }
      },
      beforeUpdate: async (utilisateur) => {
        if (utilisateur.changed('motDePasse')) {
          utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, 10);
        }
      },
    },
  });

  Utilisateur.prototype.comparerMotDePasse = async function (candidat) {
    return bcrypt.compare(candidat, this.motDePasse);
  };

  Utilisateur.prototype.toJSON = function () {
    const valeurs = { ...this.get() };
    delete valeurs.motDePasse;
    return valeurs;
  };

  return Utilisateur;
};
