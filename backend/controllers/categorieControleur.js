const { Categorie, Produit } = require('../models');
const { reponseSucces, reponseErreur } = require('../utils/reponseApi');

// POST / - Creer une categorie
const creer = async (req, res) => {
  try {
    const { nom, description } = req.body;

    const categorie = await Categorie.create({
      boutiqueId: req.boutique.id,
      nom,
      description,
    });

    return reponseSucces(res, 201, 'Categorie creee avec succes.', categorie);
  } catch (erreur) {
    if (erreur.name === 'SequelizeUniqueConstraintError') {
      return reponseErreur(res, 409, 'Une categorie avec ce nom existe deja dans cette boutique.');
    }
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map(e => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la creation de la categorie.');
  }
};

// GET / - Lister les categories d'une boutique
const lister = async (req, res) => {
  try {
    const categories = await Categorie.findAll({
      where: { boutiqueId: req.boutique.id },
      order: [['nom', 'ASC']],
    });

    return reponseSucces(res, 200, 'Liste des categories.', categories);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des categories.');
  }
};

// PUT /:id - Modifier une categorie
const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description } = req.body;

    const categorie = await Categorie.findByPk(id);

    if (!categorie) {
      return reponseErreur(res, 404, 'Categorie non trouvee.');
    }

    // Verifier que la categorie appartient a la boutique
    if (categorie.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Cette categorie n\'appartient pas a cette boutique.');
    }

    await categorie.update({
      nom: nom || categorie.nom,
      description: description !== undefined ? description : categorie.description,
    });

    return reponseSucces(res, 200, 'Categorie modifiee avec succes.', categorie);
  } catch (erreur) {
    if (erreur.name === 'SequelizeUniqueConstraintError') {
      return reponseErreur(res, 409, 'Une categorie avec ce nom existe deja dans cette boutique.');
    }
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map(e => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la modification de la categorie.');
  }
};

// DELETE /:id - Supprimer une categorie
const supprimer = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await Categorie.findByPk(id);

    if (!categorie) {
      return reponseErreur(res, 404, 'Categorie non trouvee.');
    }

    // Verifier que la categorie appartient a la boutique
    if (categorie.boutiqueId !== req.boutique.id) {
      return reponseErreur(res, 403, 'Cette categorie n\'appartient pas a cette boutique.');
    }

    // Verifier qu'aucun produit n'utilise cette categorie
    const produitsCount = await Produit.count({
      where: { categorieId: id },
    });

    if (produitsCount > 0) {
      return reponseErreur(
        res,
        400,
        `Impossible de supprimer cette categorie. Elle est utilisee par ${produitsCount} produit(s).`
      );
    }

    await categorie.destroy();

    return reponseSucces(res, 200, 'Categorie supprimee avec succes.');
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la suppression de la categorie.');
  }
};

module.exports = {
  creer,
  lister,
  modifier,
  supprimer,
};
