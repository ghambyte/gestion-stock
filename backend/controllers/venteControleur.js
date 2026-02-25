const { Vente, LigneVente, Produit, Client, Echeance, Paiement, MouvementStock } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { reponseSucces, reponseErreur, reponsePaginee } = require('../utils/reponseApi');
const { calculerPagination, construirePagination } = require('../utils/helpers');

// POST / - Creer une vente
const creer = async (req, res) => {
  try {
    const {
      clientId,
      typeVente,
      lignes,
      modePaiement,
      acompte,
      nombreEcheances,
      dateDebutEcheances,
      notes,
    } = req.body;

    if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {
      return reponseErreur(res, 400, 'Les lignes de vente sont requises.');
    }

    if (!['comptant', 'echeance'].includes(typeVente)) {
      return reponseErreur(res, 400, 'Le type de vente doit etre "comptant" ou "echeance".');
    }

    if (typeVente === 'echeance' && (!nombreEcheances || nombreEcheances < 1)) {
      return reponseErreur(res, 400, 'Le nombre d\'echeances est requis pour une vente a echeance.');
    }

    const resultat = await sequelize.transaction(async (t) => {
      // Valider le stock et preparer les lignes
      const lignesPreparees = [];
      let montantTotal = 0;

      for (const ligne of lignes) {
        const produit = await Produit.findByPk(ligne.produitId, { transaction: t });

        if (!produit) {
          throw { status: 404, message: `Produit avec l'id ${ligne.produitId} non trouve.` };
        }

        if (produit.boutiqueId !== req.boutique.id) {
          throw { status: 403, message: `Le produit "${produit.nom}" n'appartient pas a cette boutique.` };
        }

        if (produit.quantiteStock < ligne.quantite) {
          throw {
            status: 400,
            message: `Stock insuffisant pour "${produit.nom}". Disponible: ${produit.quantiteStock}, Demande: ${ligne.quantite}.`,
          };
        }

        const prixUnitaire = parseFloat(produit.prixVente);
        const montantLigne = prixUnitaire * ligne.quantite;

        lignesPreparees.push({
          produitId: produit.id,
          quantite: ligne.quantite,
          prixUnitaire,
          montantLigne,
          produit,
        });

        montantTotal += montantLigne;
      }

      let vente;

      if (typeVente === 'comptant') {
        // Vente comptant
        vente = await Vente.create(
          {
            boutiqueId: req.boutique.id,
            clientId: clientId || null,
            typeVente: 'comptant',
            montantTotal,
            montantPaye: montantTotal,
            montantRestant: 0,
            statut: 'completee',
            notes,
            dateVente: new Date(),
          },
          { transaction: t }
        );

        // Creer les lignes de vente
        for (const ligne of lignesPreparees) {
          await LigneVente.create(
            {
              venteId: vente.id,
              produitId: ligne.produitId,
              quantite: ligne.quantite,
              prixUnitaire: ligne.prixUnitaire,
              montantLigne: ligne.montantLigne,
            },
            { transaction: t }
          );
        }

        // Creer le paiement unique
        await Paiement.create(
          {
            venteId: vente.id,
            boutiqueId: req.boutique.id,
            montant: montantTotal,
            modePaiement: modePaiement || 'especes',
            datePaiement: new Date(),
          },
          { transaction: t }
        );
      } else {
        // Vente a echeance
        const montantAcompte = parseFloat(acompte) || 0;
        const montantRestant = montantTotal - montantAcompte;

        vente = await Vente.create(
          {
            boutiqueId: req.boutique.id,
            clientId: clientId || null,
            typeVente: 'echeance',
            montantTotal,
            montantPaye: montantAcompte,
            montantRestant,
            statut: montantRestant <= 0 ? 'completee' : 'en_cours',
            nombreEcheances,
            notes,
            dateVente: new Date(),
          },
          { transaction: t }
        );

        // Creer les lignes de vente
        for (const ligne of lignesPreparees) {
          await LigneVente.create(
            {
              venteId: vente.id,
              produitId: ligne.produitId,
              quantite: ligne.quantite,
              prixUnitaire: ligne.prixUnitaire,
              montantLigne: ligne.montantLigne,
            },
            { transaction: t }
          );
        }

        // Creer le paiement d'acompte si fourni
        if (montantAcompte > 0) {
          await Paiement.create(
            {
              venteId: vente.id,
              boutiqueId: req.boutique.id,
              montant: montantAcompte,
              modePaiement: modePaiement || 'especes',
              datePaiement: new Date(),
              notes: 'Acompte initial',
            },
            { transaction: t }
          );
        }

        // Generer les echeances
        const montantParEcheance = Math.floor((montantRestant / nombreEcheances) * 100) / 100;
        let dateDebut = dateDebutEcheances ? new Date(dateDebutEcheances) : new Date();

        if (!dateDebutEcheances) {
          dateDebut.setDate(dateDebut.getDate() + 30);
        }

        for (let i = 0; i < nombreEcheances; i++) {
          const dateEcheance = new Date(dateDebut);
          dateEcheance.setMonth(dateEcheance.getMonth() + i);

          // Le dernier echeance absorbe le reste pour eviter les arrondis
          const montantEcheance = i === nombreEcheances - 1
            ? montantRestant - montantParEcheance * (nombreEcheances - 1)
            : montantParEcheance;

          await Echeance.create(
            {
              venteId: vente.id,
              boutiqueId: req.boutique.id,
              numeroEcheance: i + 1,
              montant: montantEcheance,
              dateEcheance,
              statut: 'en_attente',
            },
            { transaction: t }
          );
        }
      }

      // Decrementer le stock et creer les mouvements
      for (const ligne of lignesPreparees) {
        const quantiteAvant = ligne.produit.quantiteStock;
        const quantiteApres = quantiteAvant - ligne.quantite;

        await ligne.produit.update(
          { quantiteStock: quantiteApres },
          { transaction: t }
        );

        await MouvementStock.create(
          {
            boutiqueId: req.boutique.id,
            produitId: ligne.produitId,
            type: 'sortie',
            quantite: ligne.quantite,
            quantiteAvant,
            quantiteApres,
            motif: 'vente',
            referenceId: vente.id,
          },
          { transaction: t }
        );
      }

      // Recharger la vente avec toutes les associations
      const venteComplete = await Vente.findByPk(vente.id, {
        include: [
          { model: Client, as: 'client' },
          { model: LigneVente, as: 'lignes', include: [{ model: Produit, as: 'produit' }] },
          { model: Echeance, as: 'echeances' },
          { model: Paiement, as: 'paiements' },
        ],
        transaction: t,
      });

      return venteComplete;
    });

    return reponseSucces(res, 201, 'Vente creee avec succes.', resultat);
  } catch (erreur) {
    if (erreur.status) {
      return reponseErreur(res, erreur.status, erreur.message);
    }
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map((e) => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la creation de la vente.');
  }
};

// GET / - Lister les ventes d'une boutique
const lister = async (req, res) => {
  try {
    const { typeVente, statut, clientId, dateDebut, dateFin, page, limite } = req.query;
    const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

    const where = { boutiqueId: req.boutique.id };

    if (typeVente) {
      where.typeVente = typeVente;
    }

    if (statut) {
      where.statut = statut;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (dateDebut || dateFin) {
      where.dateVente = {};
      if (dateDebut) {
        where.dateVente[Op.gte] = new Date(dateDebut);
      }
      if (dateFin) {
        where.dateVente[Op.lte] = new Date(dateFin);
      }
    }

    const { count, rows: ventes } = await Vente.findAndCountAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'nom', 'telephone'] },
      ],
      order: [['dateVente', 'DESC']],
      limit: limiteParPage,
      offset,
    });

    const pagination = construirePagination(pageActuelle, limiteParPage, count);

    return reponsePaginee(res, 200, 'Liste des ventes.', ventes, pagination);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des ventes.');
  }
};

// GET /:id - Detail d'une vente
const detail = async (req, res) => {
  try {
    const { id } = req.params;

    const vente = await Vente.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: LigneVente, as: 'lignes', include: [{ model: Produit, as: 'produit' }] },
        { model: Echeance, as: 'echeances', order: [['numeroEcheance', 'ASC']] },
        { model: Paiement, as: 'paiements' },
      ],
    });

    if (!vente) {
      return reponseErreur(res, 404, 'Vente non trouvee.');
    }

    if (vente.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Cette vente n\'appartient pas a cette boutique.');
    }

    return reponseSucces(res, 200, 'Detail de la vente.', vente);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation de la vente.');
  }
};

// PUT /:id/annuler - Annuler une vente
const annuler = async (req, res) => {
  try {
    const { id } = req.params;

    const resultat = await sequelize.transaction(async (t) => {
      const vente = await Vente.findByPk(id, {
        include: [
          { model: LigneVente, as: 'lignes', include: [{ model: Produit, as: 'produit' }] },
        ],
        transaction: t,
      });

      if (!vente) {
        throw { status: 404, message: 'Vente non trouvee.' };
      }

      if (vente.boutiqueId !== req.boutique.id) {
        throw { status: 403, message: 'Cette vente n\'appartient pas a cette boutique.' };
      }

      if (vente.statut === 'annulee') {
        throw { status: 400, message: 'Cette vente est deja annulee.' };
      }

      // Restaurer le stock pour chaque ligne
      for (const ligne of vente.lignes) {
        const produit = ligne.produit;
        const quantiteAvant = produit.quantiteStock;
        const quantiteApres = quantiteAvant + ligne.quantite;

        await produit.update(
          { quantiteStock: quantiteApres },
          { transaction: t }
        );

        await MouvementStock.create(
          {
            boutiqueId: req.boutique.id,
            produitId: produit.id,
            type: 'entree',
            quantite: ligne.quantite,
            quantiteAvant,
            quantiteApres,
            motif: 'annulation_vente',
            referenceId: vente.id,
          },
          { transaction: t }
        );
      }

      // Mettre a jour le statut de la vente
      await vente.update({ statut: 'annulee' }, { transaction: t });

      // Recharger la vente complete
      const venteAnnulee = await Vente.findByPk(id, {
        include: [
          { model: Client, as: 'client' },
          { model: LigneVente, as: 'lignes', include: [{ model: Produit, as: 'produit' }] },
          { model: Echeance, as: 'echeances' },
          { model: Paiement, as: 'paiements' },
        ],
        transaction: t,
      });

      return venteAnnulee;
    });

    return reponseSucces(res, 200, 'Vente annulee avec succes.', resultat);
  } catch (erreur) {
    if (erreur.status) {
      return reponseErreur(res, erreur.status, erreur.message);
    }
    return reponseErreur(res, 500, 'Erreur lors de l\'annulation de la vente.');
  }
};

module.exports = {
  creer,
  lister,
  detail,
  annuler,
};
