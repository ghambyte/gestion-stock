const { Vente, Produit, LigneVente, Client, Echeance, MouvementStock } = require('../models');
const sequelize = require('../config/database');
const { Op, fn, col, literal } = require('sequelize');
const { reponseSucces, reponseErreur } = require('../utils/reponseApi');

// GET /resume - Resume du tableau de bord
const resume = async (req, res) => {
  try {
    const boutiqueId = req.boutique.id;

    // Debut du mois courant
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const aujourdhui = new Date();

    // Chiffre d'affaires du mois (total montantPaye des ventes non annulees ce mois)
    const caResult = await Vente.findOne({
      where: {
        boutiqueId,
        statut: { [Op.ne]: 'annulee' },
        dateVente: { [Op.gte]: debutMois },
      },
      attributes: [
        [fn('SUM', col('montantPaye')), 'total'],
      ],
      raw: true,
    });

    const chiffreAffaires = parseFloat(caResult.total) || 0;

    // Total ventes du mois
    const totalVentes = await Vente.count({
      where: {
        boutiqueId,
        statut: { [Op.ne]: 'annulee' },
        dateVente: { [Op.gte]: debutMois },
      },
    });

    // Montant en attente (somme montantRestant des ventes en cours)
    const enAttenteResult = await Vente.findOne({
      where: {
        boutiqueId,
        statut: 'en_cours',
      },
      attributes: [
        [fn('SUM', col('montantRestant')), 'total'],
      ],
      raw: true,
    });

    const montantEnAttente = parseFloat(enAttenteResult.total) || 0;

    // Valeur du stock (somme prixAchat * quantiteStock)
    const stockResult = await Produit.findOne({
      where: { boutiqueId },
      attributes: [
        [fn('SUM', literal('`prixAchat` * `quantiteStock`')), 'total'],
      ],
      raw: true,
    });

    const valeurStock = parseFloat(stockResult.total) || 0;

    // Clients actifs ce mois
    const clientsActifs = await Vente.count({
      where: {
        boutiqueId,
        statut: { [Op.ne]: 'annulee' },
        dateVente: { [Op.gte]: debutMois },
        clientId: { [Op.ne]: null },
      },
      distinct: true,
      col: 'clientId',
    });

    // Produits en alerte de stock
    const produitsStockBas = await Produit.count({
      where: {
        boutiqueId,
        quantiteStock: { [Op.lte]: col('seuilAlerte') },
      },
    });

    return reponseSucces(res, 200, 'Resume du tableau de bord.', {
      chiffreAffaires,
      totalVentes,
      montantEnAttente,
      valeurStock,
      clientsActifs,
      produitsStockBas,
    });
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation du resume.');
  }
};

// GET /revenus - Revenus groupes par periode
const revenus = async (req, res) => {
  try {
    const boutiqueId = req.boutique.id;
    const { periode } = req.query;

    let dateDebut;
    let groupBy;
    let selectDate;

    if (periode === 'mois') {
      // 12 derniers mois
      dateDebut = new Date();
      dateDebut.setMonth(dateDebut.getMonth() - 12);
      dateDebut.setDate(1);
      dateDebut.setHours(0, 0, 0, 0);

      groupBy = [fn('DATE_FORMAT', col('dateVente'), '%Y-%m')];
      selectDate = [fn('DATE_FORMAT', col('dateVente'), '%Y-%m'), 'periode'];
    } else if (periode === 'semaine') {
      // 12 dernieres semaines
      dateDebut = new Date();
      dateDebut.setDate(dateDebut.getDate() - 84);
      dateDebut.setHours(0, 0, 0, 0);

      groupBy = [fn('DATE_FORMAT', col('dateVente'), '%x-S%v')];
      selectDate = [fn('DATE_FORMAT', col('dateVente'), '%x-S%v'), 'periode'];
    } else {
      // Par defaut: 30 derniers jours
      dateDebut = new Date();
      dateDebut.setDate(dateDebut.getDate() - 30);
      dateDebut.setHours(0, 0, 0, 0);

      groupBy = [fn('DATE', col('dateVente'))];
      selectDate = [fn('DATE', col('dateVente')), 'periode'];
    }

    const resultats = await Vente.findAll({
      where: {
        boutiqueId,
        statut: { [Op.ne]: 'annulee' },
        dateVente: { [Op.gte]: dateDebut },
      },
      attributes: [
        selectDate,
        [fn('SUM', col('montantPaye')), 'revenus'],
        [fn('COUNT', col('id')), 'nombreVentes'],
      ],
      group: groupBy,
      order: [[literal('periode'), 'ASC']],
      raw: true,
    });

    return reponseSucces(res, 200, 'Donnees de revenus.', resultats);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des revenus.');
  }
};

// GET /meilleurs-produits - Top 10 produits les plus vendus
const meilleursProducts = async (req, res) => {
  try {
    const boutiqueId = req.boutique.id;

    const produits = await LigneVente.findAll({
      attributes: [
        'produitId',
        [fn('SUM', col('quantite')), 'totalVendu'],
        [fn('SUM', col('montantLigne')), 'totalMontant'],
      ],
      include: [
        {
          model: Produit,
          as: 'produit',
          attributes: ['id', 'nom', 'prixVente'],
          where: { boutiqueId },
        },
      ],
      group: ['produitId', 'produit.id'],
      order: [[literal('totalVendu'), 'DESC']],
      limit: 10,
      raw: false,
    });

    return reponseSucces(res, 200, 'Meilleurs produits.', produits);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des meilleurs produits.');
  }
};

// GET /alertes - Alertes stock + echeances en retard
const alertes = async (req, res) => {
  try {
    const boutiqueId = req.boutique.id;
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    // Produits en alerte de stock
    const alertesStock = await Produit.findAll({
      where: {
        boutiqueId,
        quantiteStock: { [Op.lte]: col('seuilAlerte') },
      },
      attributes: ['id', 'nom', 'quantiteStock', 'seuilAlerte'],
      order: [['quantiteStock', 'ASC']],
    });

    // Echeances en retard
    const echeancesEnRetard = await Echeance.findAll({
      where: {
        boutiqueId,
        dateEcheance: { [Op.lt]: aujourdhui },
        statut: 'en_attente',
      },
      include: [
        {
          model: Vente,
          as: 'vente' ,
          attributes: ['id', 'montantTotal', 'montantRestant'],
          include: [
            { model: Client, as: 'client', attributes: ['id', 'nom', 'telephone'] },
          ],
        },
      ],
      order: [['dateEcheance', 'ASC']],
    });

    return reponseSucces(res, 200, 'Alertes.', {
      alertesStock: {
        nombre: alertesStock.length,
        produits: alertesStock,
      },
      echeancesEnRetard: {
        nombre: echeancesEnRetard.length,
        echeances: echeancesEnRetard,
      },
    });
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des alertes.');
  }
};

module.exports = {
  resume,
  revenus,
  meilleursProducts,
  alertes,
};
