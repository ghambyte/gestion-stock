const sequelize = require('../config/database');

// Importer les modeles
const Utilisateur = require('./Utilisateur')(sequelize);
const Boutique = require('./Boutique')(sequelize);
const Categorie = require('./Categorie')(sequelize);
const Produit = require('./Produit')(sequelize);
const MouvementStock = require('./MouvementStock')(sequelize);
const Client = require('./Client')(sequelize);
const Vente = require('./Vente')(sequelize);
const LigneVente = require('./LigneVente')(sequelize);
const Echeance = require('./Echeance')(sequelize);
const Paiement = require('./Paiement')(sequelize);

// === Associations ===

// Utilisateur <-> Boutique
Utilisateur.hasMany(Boutique, { foreignKey: 'utilisateurId', as: 'boutiques' });
Boutique.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'proprietaire' });

// Boutique <-> Categorie
Boutique.hasMany(Categorie, { foreignKey: 'boutiqueId', as: 'categories' });
Categorie.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Boutique <-> Produit
Boutique.hasMany(Produit, { foreignKey: 'boutiqueId', as: 'produits' });
Produit.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Categorie <-> Produit
Categorie.hasMany(Produit, { foreignKey: 'categorieId', as: 'produits' });
Produit.belongsTo(Categorie, { foreignKey: 'categorieId', as: 'categorie' });

// Produit <-> MouvementStock
Produit.hasMany(MouvementStock, { foreignKey: 'produitId', as: 'mouvements' });
MouvementStock.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });
Boutique.hasMany(MouvementStock, { foreignKey: 'boutiqueId' });
MouvementStock.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Boutique <-> Client
Boutique.hasMany(Client, { foreignKey: 'boutiqueId', as: 'clients' });
Client.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Boutique <-> Vente
Boutique.hasMany(Vente, { foreignKey: 'boutiqueId', as: 'ventes' });
Vente.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Client <-> Vente
Client.hasMany(Vente, { foreignKey: 'clientId', as: 'ventes' });
Vente.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Vente <-> LigneVente
Vente.hasMany(LigneVente, { foreignKey: 'venteId', as: 'lignes' });
LigneVente.belongsTo(Vente, { foreignKey: 'venteId' });

// Produit <-> LigneVente
Produit.hasMany(LigneVente, { foreignKey: 'produitId' });
LigneVente.belongsTo(Produit, { foreignKey: 'produitId', as: 'produit' });

// Vente <-> Echeance
Vente.hasMany(Echeance, { foreignKey: 'venteId', as: 'echeances' });
Echeance.belongsTo(Vente, { foreignKey: 'venteId', as: 'vente' });
Boutique.hasMany(Echeance, { foreignKey: 'boutiqueId' });
Echeance.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Vente <-> Paiement
Vente.hasMany(Paiement, { foreignKey: 'venteId', as: 'paiements' });
Paiement.belongsTo(Vente, { foreignKey: 'venteId', as: 'vente' });
Boutique.hasMany(Paiement, { foreignKey: 'boutiqueId' });
Paiement.belongsTo(Boutique, { foreignKey: 'boutiqueId' });

// Echeance <-> Paiement
Echeance.hasMany(Paiement, { foreignKey: 'echeanceId', as: 'paiements' });
Paiement.belongsTo(Echeance, { foreignKey: 'echeanceId', as: 'echeance' });

module.exports = {
  sequelize,
  Utilisateur,
  Boutique,
  Categorie,
  Produit,
  MouvementStock,
  Client,
  Vente,
  LigneVente,
  Echeance,
  Paiement,
};
