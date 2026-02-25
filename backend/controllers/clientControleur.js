const { Client, Vente, LigneVente, Paiement } = require('../models');
const { Op } = require('sequelize');
const { reponseSucces, reponseErreur, reponsePaginee } = require('../utils/reponseApi');
const { calculerPagination, construirePagination } = require('../utils/helpers');

// POST / - Creer un client
const creer = async (req, res) => {
  try {
    const { nom, telephone, email, adresse } = req.body;

    const client = await Client.create({
      boutiqueId: req.boutique.id,
      nom,
      telephone,
      email,
      adresse,
    });

    return reponseSucces(res, 201, 'Client cree avec succes.', client);
  } catch (erreur) {
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map((e) => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la creation du client.');
  }
};

// GET / - Lister les clients d'une boutique
const lister = async (req, res) => {
  try {
    const { recherche, page, limite } = req.query;
    const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

    const where = { boutiqueId: req.boutique.id };

    if (recherche) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${recherche}%` } },
        { telephone: { [Op.like]: `%${recherche}%` } },
      ];
    }

    const { count, rows: clients } = await Client.findAndCountAll({
      where,
      include: [
        {
          model: Vente,
          as: 'ventes',
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            Client.sequelize.fn('COUNT', Client.sequelize.col('ventes.id')),
            'nombreVentes',
          ],
        ],
      },
      group: ['Client.id'],
      order: [['createdAt', 'DESC']],
      limit: limiteParPage,
      offset,
      subQuery: false,
    });

    const total = Array.isArray(count) ? count.length : count;
    const pagination = construirePagination(pageActuelle, limiteParPage, total);

    return reponsePaginee(res, 200, 'Liste des clients.', clients, pagination);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des clients.');
  }
};

// GET /:id - Detail d'un client
const detail = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Vente,
          as: 'ventes',
          include: [
            { model: LigneVente, as: 'lignes' },
            { model: Paiement, as: 'paiements' },
          ],
        },
      ],
    });

    if (!client) {
      return reponseErreur(res, 404, 'Client non trouve.');
    }

    if (client.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce client n\'appartient pas a cette boutique.');
    }

    const clientData = client.toJSON();

    // Calculer le total des achats et l'encours
    let totalAchats = 0;
    let encours = 0;

    if (clientData.ventes) {
      for (const vente of clientData.ventes) {
        if (vente.statut !== 'annulee') {
          totalAchats += parseFloat(vente.montantTotal) || 0;
        }
        if (vente.statut === 'en_cours') {
          encours += parseFloat(vente.montantRestant) || 0;
        }
      }
    }

    clientData.totalAchats = totalAchats;
    clientData.encours = encours;

    return reponseSucces(res, 200, 'Detail du client.', clientData);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation du client.');
  }
};

// PUT /:id - Modifier un client
const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, telephone, email, adresse } = req.body;

    const client = await Client.findByPk(id);

    if (!client) {
      return reponseErreur(res, 404, 'Client non trouve.');
    }

    if (client.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce client n\'appartient pas a cette boutique.');
    }

    await client.update({
      nom: nom !== undefined ? nom : client.nom,
      telephone: telephone !== undefined ? telephone : client.telephone,
      email: email !== undefined ? email : client.email,
      adresse: adresse !== undefined ? adresse : client.adresse,
    });

    return reponseSucces(res, 200, 'Client modifie avec succes.', client);
  } catch (erreur) {
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map((e) => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la modification du client.');
  }
};

// DELETE /:id - Supprimer un client (soft delete)
const supprimer = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return reponseErreur(res, 404, 'Client non trouve.');
    }

    if (client.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce client n\'appartient pas a cette boutique.');
    }

    await client.destroy();

    return reponseSucces(res, 200, 'Client supprime avec succes.');
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la suppression du client.');
  }
};

module.exports = {
  creer,
  lister,
  detail,
  modifier,
  supprimer,
};
