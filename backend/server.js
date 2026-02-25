const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const demarrer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion a la base de donnees MySQL reussie.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Modeles synchronises avec la base de donnees.');

    app.listen(PORT, () => {
      console.log(`Serveur KALIS demarre sur le port ${PORT}`);
      console.log(`Environnement: ${process.env.NODE_ENV}`);
    });
  } catch (erreur) {
    console.error('Erreur au demarrage:', erreur.message);
    process.exit(1);
  }
};

demarrer();
