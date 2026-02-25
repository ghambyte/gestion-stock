const { Op } = require('sequelize');
const { Produit, Categorie, MouvementStock } = require('../models');
const sequelize = require('../config/database');
const { reponseSucces, reponseErreur, reponsePaginee } = require('../utils/reponseApi');
const { calculerPagination, construirePagination } = require('../utils/helpers');

// POST / - Creer un produit
const creer = async (req, res) => {
  try {
    const { nom, description, categorieId, prixAchat, prixVente, quantiteStock, seuilAlerte } = req.body;

    const produit = await sequelize.transaction(async (t) => {
      const nouveauProduit = await Produit.create(
        {
          boutiqueId: req.boutique.id,
          nom,
          description,
          categorieId,
          prixAchat,
          prixVente,
          quantiteStock: quantiteStock || 0,
          seuilAlerte,
        },
        { transaction: t }
      );

      if (quantiteStock && quantiteStock > 0) {
        await MouvementStock.create(
          {
            boutiqueId: req.boutique.id,
            produitId: nouveauProduit.id,
            type: 'entree',
            quantite: quantiteStock,
            quantiteAvant: 0,
            quantiteApres: quantiteStock,
            motif: 'stock_initial',
          },
          { transaction: t }
        );
      }

      return nouveauProduit;
    });

    return reponseSucces(res, 201, 'Produit cree avec succes.', produit);
  } catch (erreur) {
    if (erreur.name === 'SequelizeUniqueConstraintError') {
      return reponseErreur(res, 409, 'Un produit avec ce nom existe deja dans cette boutique.');
    }
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map((e) => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la creation du produit.');
  }
};

// GET / - Lister les produits d'une boutique
const lister = async (req, res) => {
  try {
    const { recherche, categorieId, stockBas, page, limite } = req.query;
    const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

    const where = { boutiqueId: req.boutique.id };

    if (recherche) {
      where.nom = { [Op.like]: `%${recherche}%` };
    }

    if (categorieId) {
      where.categorieId = categorieId;
    }

    if (stockBas === 'true') {
      where.quantiteStock = { [Op.lte]: sequelize.col('seuilAlerte') };
    }

    const { count, rows: produits } = await Produit.findAndCountAll({
      where,
      include: [{ model: Categorie, as: 'categorie' }],
      order: [['createdAt', 'DESC']],
      limit: limiteParPage,
      offset,
    });

    const pagination = construirePagination(pageActuelle, limiteParPage, count);

    return reponsePaginee(res, 200, 'Liste des produits.', produits, pagination);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des produits.');
  }
};

// GET /:id - Detail d'un produit
const detail = async (req, res) => {
  try {
    const { id } = req.params;

    const produit = await Produit.findByPk(id, {
      include: [{ model: Categorie, as: 'categorie' }],
    });

    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    if (produit.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce produit n\'appartient pas a cette boutique.');
    }

    return reponseSucces(res, 200, 'Detail du produit.', produit);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation du produit.');
  }
};

// PUT /:id - Modifier un produit
const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, categorieId, prixAchat, prixVente, seuilAlerte } = req.body;

    const produit = await Produit.findByPk(id);

    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    if (produit.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce produit n\'appartient pas a cette boutique.');
    }

    await produit.update({
      nom: nom !== undefined ? nom : produit.nom,
      description: description !== undefined ? description : produit.description,
      categorieId: categorieId !== undefined ? categorieId : produit.categorieId,
      prixAchat: prixAchat !== undefined ? prixAchat : produit.prixAchat,
      prixVente: prixVente !== undefined ? prixVente : produit.prixVente,
      seuilAlerte: seuilAlerte !== undefined ? seuilAlerte : produit.seuilAlerte,
    });

    return reponseSucces(res, 200, 'Produit modifie avec succes.', produit);
  } catch (erreur) {
    if (erreur.name === 'SequelizeUniqueConstraintError') {
      return reponseErreur(res, 409, 'Un produit avec ce nom existe deja dans cette boutique.');
    }
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map((e) => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la modification du produit.');
  }
};

// DELETE /:id - Supprimer un produit (soft delete)
const supprimer = async (req, res) => {
  try {
    const { id } = req.params;

    const produit = await Produit.findByPk(id);

    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    if (produit.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce produit n\'appartient pas a cette boutique.');
    }

    await produit.destroy();

    return reponseSucces(res, 200, 'Produit supprime avec succes.');
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la suppression du produit.');
  }
};

// POST /:id/image - Uploader une image pour un produit
const uploaderImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return reponseErreur(res, 400, 'Aucun fichier image fourni.');
    }

    const produit = await Produit.findByPk(id);

    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    if (produit.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce produit n\'appartient pas a cette boutique.');
    }

    produit.image = '/uploads/' + req.file.filename;
    await produit.save();

    return reponseSucces(res, 200, 'Image uploadee avec succes.', produit);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de l\'upload de l\'image.');
  }
};

// GET /alertes - Produits avec stock bas
const alertesStock = async (req, res) => {
  try {
    const produits = await Produit.findAll({
      where: {
        boutiqueId: req.boutique.id,
        quantiteStock: { [Op.lte]: sequelize.col('seuilAlerte') },
      },
      include: [{ model: Categorie, as: 'categorie' }],
      order: [['quantiteStock', 'ASC']],
    });

    return reponseSucces(res, 200, 'Produits en alerte de stock.', produits);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des alertes de stock.');
  }
};

// POST /:id/stock - Ajuster le stock d'un produit
const ajusterStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantite, motif } = req.body;

    if (!['entree', 'ajustement'].includes(type)) {
      return reponseErreur(res, 400, 'Le type doit etre "entree" ou "ajustement".');
    }

    const resultat = await sequelize.transaction(async (t) => {
      const produit = await Produit.findByPk(id, { transaction: t });

      if (!produit) {
        throw { status: 404, message: 'Produit non trouve.' };
      }

      if (produit.boutiqueId !== req.boutique.id) {
        throw { status: 403, message: 'Ce produit n\'appartient pas a cette boutique.' };
      }

      const quantiteAvant = produit.quantiteStock;
      let quantiteApres;

      if (type === 'entree') {
        quantiteApres = quantiteAvant + quantite;
      } else {
        quantiteApres = quantite;
      }

      await produit.update({ quantiteStock: quantiteApres }, { transaction: t });

      const mouvement = await MouvementStock.create(
        {
          boutiqueId: req.boutique.id,
          produitId: produit.id,
          type,
          quantite,
          quantiteAvant,
          quantiteApres,
          motif: motif || null,
        },
        { transaction: t }
      );

      return { produit, mouvement };
    });

    return reponseSucces(res, 200, 'Stock ajuste avec succes.', resultat);
  } catch (erreur) {
    if (erreur.status) {
      return reponseErreur(res, erreur.status, erreur.message);
    }
    return reponseErreur(res, 500, 'Erreur lors de l\'ajustement du stock.');
  }
};

// GET /:id/mouvements - Mouvements de stock d'un produit
const mouvementsStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limite } = req.query;
    const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

    const produit = await Produit.findByPk(id);

    if (!produit) {
      return reponseErreur(res, 404, 'Produit non trouve.');
    }

    if (produit.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Ce produit n\'appartient pas a cette boutique.');
    }

    const { count, rows: mouvements } = await MouvementStock.findAndCountAll({
      where: { produitId: id },
      include: [{ model: Produit, as: 'produit', attributes: ['id', 'nom'] }],
      order: [['createdAt', 'DESC']],
      limit: limiteParPage,
      offset,
    });

    const pagination = construirePagination(pageActuelle, limiteParPage, count);

    return reponsePaginee(res, 200, 'Mouvements de stock du produit.', mouvements, pagination);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des mouvements de stock.');
  }
};

module.exports = {
  creer,
  lister,
  detail,
  modifier,
  supprimer,
  uploaderImage,
  alertesStock,
  ajusterStock,
  mouvementsStock,
};
