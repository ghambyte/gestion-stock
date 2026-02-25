const { Paiement, Vente, Echeance, Client } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { reponseSucces, reponseErreur, reponsePaginee } = require('../utils/reponseApi');
const { calculerPagination, construirePagination } = require('../utils/helpers');

// POST /ventes/:venteId - Enregistrer un paiement pour une vente
const enregistrerPaiement = async (req, res) => {
  try {
    const { venteId } = req.params;
    const { montant, modePaiement, echeanceId, notes } = req.body;

    const montantPaiement = parseFloat(montant);

    if (!montantPaiement || montantPaiement <= 0) {
      return reponseErreur(res, 400, 'Le montant doit etre un nombre positif.');
    }

    const resultat = await sequelize.transaction(async (t) => {
      const vente = await Vente.findByPk(venteId, { transaction: t });

      if (!vente) {
        throw { status: 404, message: 'Vente non trouvee.' };
      }

      if (vente.boutiqueId !== req.boutique.id) {
        throw { status: 403, message: 'Cette vente n\'appartient pas a cette boutique.' };
      }

      if (vente.statut !== 'en_cours') {
        throw { status: 400, message: 'Cette vente n\'est pas en cours. Impossible d\'enregistrer un paiement.' };
      }

      const montantRestant = parseFloat(vente.montantRestant);

      if (montantPaiement > montantRestant) {
        throw {
          status: 400,
          message: `Le montant du paiement (${montantPaiement}) depasse le montant restant (${montantRestant}).`,
        };
      }

      // Creer le paiement
      const paiement = await Paiement.create(
        {
          venteId: vente.id,
          boutiqueId: req.boutique.id,
          echeanceId: echeanceId || null,
          montant: montantPaiement,
          modePaiement: modePaiement || 'especes',
          notes,
          datePaiement: new Date(),
        },
        { transaction: t }
      );

      // Mettre a jour la vente
      const nouveauMontantPaye = parseFloat(vente.montantPaye) + montantPaiement;
      const nouveauMontantRestant = parseFloat(vente.montantTotal) - nouveauMontantPaye;
      const nouveauStatut = nouveauMontantRestant <= 0 ? 'completee' : 'en_cours';

      await vente.update(
        {
          montantPaye: nouveauMontantPaye,
          montantRestant: nouveauMontantRestant,
          statut: nouveauStatut,
        },
        { transaction: t }
      );

      // Si echeanceId fourni, mettre a jour l'echeance
      if (echeanceId) {
        const echeance = await Echeance.findByPk(echeanceId, { transaction: t });

        if (echeance && echeance.venteId === vente.id) {
          await echeance.update(
            {
              statut: 'payee',
              datePaiement: new Date(),
            },
            { transaction: t }
          );
        }
      }

      return paiement;
    });

    return reponseSucces(res, 201, 'Paiement enregistre avec succes.', resultat);
  } catch (erreur) {
    if (erreur.status) {
      return reponseErreur(res, erreur.status, erreur.message);
    }
    return reponseErreur(res, 500, 'Erreur lors de l\'enregistrement du paiement.');
  }
};

// GET / - Lister les paiements d'une boutique
const listerPaiements = async (req, res) => {
  try {
    const { dateDebut, dateFin, venteId, page, limite } = req.query;
    const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

    const where = { boutiqueId: req.boutique.id };

    if (venteId) {
      where.venteId = venteId;
    }

    if (dateDebut || dateFin) {
      where.datePaiement = {};
      if (dateDebut) {
        where.datePaiement[Op.gte] = new Date(dateDebut);
      }
      if (dateFin) {
        where.datePaiement[Op.lte] = new Date(dateFin);
      }
    }

    const { count, rows: paiements } = await Paiement.findAndCountAll({
      where,
      include: [
        {
          model: Vente,
          as: 'vente',
          attributes: ['id', 'montantTotal', 'montantRestant', 'statut', 'typeVente'],
          include: [
            { model: Client, as: 'client', attributes: ['id', 'nom', 'telephone'] },
          ],
        },
      ],
      order: [['datePaiement', 'DESC']],
      limit: limiteParPage,
      offset,
    });

    const pagination = construirePagination(pageActuelle, limiteParPage, count);

    return reponsePaginee(res, 200, 'Liste des paiements.', paiements, pagination);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des paiements.');
  }
};

// GET /recouvrements - Vue d'ensemble des recouvrements
const recouvrements = async (req, res) => {
  try {
    const boutiqueId = req.boutique.id;
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const dans30Jours = new Date(aujourdhui);
    dans30Jours.setDate(dans30Jours.getDate() + 30);

    // Total en cours (montant restant sur toutes les ventes en cours)
    const ventesEnCours = await Vente.findAll({
      where: {
        boutiqueId,
        statut: 'en_cours',
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('montantRestant')), 'total'],
      ],
      raw: true,
    });

    const totalEnCours = parseFloat(ventesEnCours[0].total) || 0;

    // Echeances en retard
    const whereEnRetard = {
      boutiqueId,
      dateEcheance: { [Op.lt]: aujourdhui },
      statut: 'en_attente',
    };

    const nombreEcheancesEnRetard = await Echeance.count({ where: whereEnRetard });

    const sommeEnRetard = await Echeance.findAll({
      where: whereEnRetard,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('montant')), 'total'],
      ],
      raw: true,
    });

    const totalEnRetard = parseFloat(sommeEnRetard[0]?.total) || 0;

    // Echeances a venir (prochains 30 jours)
    const echeancesAVenir = await Echeance.count({
      where: {
        boutiqueId,
        dateEcheance: {
          [Op.gte]: aujourdhui,
          [Op.lte]: dans30Jours,
        },
        statut: 'en_attente',
      },
    });

    return reponseSucces(res, 200, 'Donnees de recouvrement.', {
      totalEnCours,
      totalEnRetard,
      echeancesEnRetard: nombreEcheancesEnRetard,
      echeancesAVenir,
    });
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des donnees de recouvrement.');
  }
};

// GET /recouvrements/clients-en-retard - Clients avec echeances en retard
const clientsEnRetard = async (req, res) => {
  try {
    const boutiqueId = req.boutique.id;
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const clients = await Client.findAll({
      where: { boutiqueId },
      include: [
        {
          model: Vente,
          as: 'ventes',
          where: { statut: 'en_cours' },
          required: true,
          include: [
            {
              model: Echeance,
              as: 'echeances',
              where: {
                dateEcheance: { [Op.lt]: aujourdhui },
                statut: 'en_attente',
              },
              required: true,
            },
          ],
        },
      ],
    });

    // Formater les resultats avec les totaux
    const resultats = clients.map((client) => {
      const clientData = client.toJSON();
      let totalEnRetard = 0;
      let nombreEcheancesEnRetard = 0;

      for (const vente of clientData.ventes) {
        for (const echeance of vente.echeances) {
          totalEnRetard += parseFloat(echeance.montant) || 0;
          nombreEcheancesEnRetard++;
        }
      }

      return {
        id: clientData.id,
        nom: clientData.nom,
        telephone: clientData.telephone,
        email: clientData.email,
        totalEnRetard,
        nombreEcheancesEnRetard,
        ventes: clientData.ventes,
      };
    });

    return reponseSucces(res, 200, 'Clients en retard de paiement.', resultats);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des clients en retard.');
  }
};

module.exports = {
  enregistrerPaiement,
  listerPaiements,
  recouvrements,
  clientsEnRetard,
};
