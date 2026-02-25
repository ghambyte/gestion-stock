require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, Utilisateur, Boutique, Categorie } = require('../models');

const initialiser = async () => {
  try {
    console.log('Connexion a la base de donnees...');
    await sequelize.authenticate();
    console.log('Connecte.');

    console.log('Synchronisation des tables...');
    await sequelize.sync({ force: true });
    console.log('Tables creees.');

    // Creer le super admin
    const admin = await Utilisateur.create({
      nom: 'Super Admin',
      email: 'admin@kalis.com',
      motDePasse: 'admin123',
      telephone: '770000000',
      role: 'super_admin',
      estActif: true,
    });
    console.log('Super Admin cree:', admin.email);

    // Creer un vendeur de test
    const vendeur = await Utilisateur.create({
      nom: 'Vendeur Test',
      email: 'vendeur@kalis.com',
      motDePasse: 'vendeur123',
      telephone: '771234567',
      role: 'vendeur',
      estActif: true,
    });
    console.log('Vendeur test cree:', vendeur.email);

    // Creer une boutique de test
    const boutique = await Boutique.create({
      utilisateurId: vendeur.id,
      nom: 'Boutique Test',
      adresse: 'Dakar, Senegal',
      telephone: '771234567',
      devise: 'FCFA',
      statut: 'active',
    });
    console.log('Boutique test creee:', boutique.nom);

    // Creer des categories de test
    const categories = await Categorie.bulkCreate([
      { boutiqueId: boutique.id, nom: 'Electronique', description: 'Appareils electroniques' },
      { boutiqueId: boutique.id, nom: 'Vetements', description: 'Habillement et mode' },
      { boutiqueId: boutique.id, nom: 'Alimentation', description: 'Produits alimentaires' },
    ]);
    console.log(`${categories.length} categories creees.`);

    console.log('\nInitialisation terminee avec succes !');
    console.log('Comptes de test:');
    console.log('  Admin: admin@kalis.com / admin123');
    console.log('  Vendeur: vendeur@kalis.com / vendeur123');

    process.exit(0);
  } catch (erreur) {
    console.error('Erreur lors de l\'initialisation:', erreur.message);
    console.error(erreur);
    process.exit(1);
  }
};

initialiser();
