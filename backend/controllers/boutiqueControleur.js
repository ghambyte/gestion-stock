const { Boutique, Utilisateur } = require('../models');
const { reponseSucces, reponseErreur, reponsePaginee } = require('../utils/reponseApi');
const { calculerPagination, construirePagination } = require('../utils/helpers');

// POST / - Creer une boutique
const creer = async (req, res) => {
  try {
    const { nom, adresse, telephone, devise } = req.body;

    const boutique = await Boutique.create({
      utilisateurId: req.utilisateur.id,
      nom,
      adresse,
      telephone,
      devise: devise || 'FCFA',
    });

    return reponseSucces(res, 201, 'Boutique creee avec succes.', boutique);
  } catch (erreur) {
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map(e => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la creation de la boutique.');
  }
};

// GET / - Lister les boutiques
const lister = async (req, res) => {
  try {
    // Si vendeur, lister ses propres boutiques
    if (req.utilisateur.role === 'vendeur') {
      const boutiques = await Boutique.findAll({
        where: { utilisateurId: req.utilisateur.id },
        order: [['createdAt', 'DESC']],
      });

      return reponseSucces(res, 200, 'Liste de vos boutiques.', boutiques);
    }

    // Si super_admin, lister toutes les boutiques avec pagination
    if (req.utilisateur.role === 'super_admin') {
      const { page, limite } = req.query;
      const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

      const { count, rows: boutiques } = await Boutique.findAndCountAll({
        include: [
          {
            model: Utilisateur,
            as: 'proprietaire',
            attributes: ['id', 'nom', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: limiteParPage,
        offset,
      });

      const pagination = construirePagination(pageActuelle, limiteParPage, count);

      return reponsePaginee(res, 200, 'Liste de toutes les boutiques.', boutiques, pagination);
    }

    return reponseErreur(res, 403, 'Acces non autorise.');
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des boutiques.');
  }
};

// GET /:id - Detail d'une boutique
const detail = async (req, res) => {
  try {
    const { id } = req.params;

    const boutique = await Boutique.findByPk(id, {
      include: [
        {
          model: Utilisateur,
          as: 'proprietaire',
          attributes: ['id', 'nom', 'email'],
        },
      ],
    });

    if (!boutique) {
      return reponseErreur(res, 404, 'Boutique non trouvee.');
    }

    // Verifier propriete ou super_admin
    if (req.utilisateur.role !== 'super_admin' && boutique.utilisateurId !== req.utilisateur.id) {
      return reponseErreur(res, 403, 'Vous n\'avez pas acces a cette boutique.');
    }

    return reponseSucces(res, 200, 'Detail de la boutique.', boutique);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la recuperation de la boutique.');
  }
};

// PUT /:id - Modifier une boutique
const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, adresse, telephone, devise, logo } = req.body;

    const boutique = await Boutique.findByPk(id);

    if (!boutique) {
      return reponseErreur(res, 404, 'Boutique non trouvee.');
    }

    // Seul le proprietaire peut modifier
    if (boutique.utilisateurId !== req.utilisateur.id) {
      return reponseErreur(res, 403, 'Vous n\'etes pas le proprietaire de cette boutique.');
    }

    await boutique.update({
      nom: nom || boutique.nom,
      adresse: adresse !== undefined ? adresse : boutique.adresse,
      telephone: telephone !== undefined ? telephone : boutique.telephone,
      devise: devise || boutique.devise,
      logo: logo !== undefined ? logo : boutique.logo,
    });

    return reponseSucces(res, 200, 'Boutique modifiee avec succes.', boutique);
  } catch (erreur) {
    if (erreur.name === 'SequelizeValidationError') {
      return reponseErreur(res, 400, 'Erreurs de validation.', erreur.errors.map(e => e.message));
    }
    return reponseErreur(res, 500, 'Erreur lors de la modification de la boutique.');
  }
};

// PUT /:id/statut - Modifier le statut d'une boutique (super_admin uniquement)
const modifierStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const statutsValides = ['active', 'suspendue'];
    if (!statut || !statutsValides.includes(statut)) {
      return reponseErreur(res, 400, 'Statut invalide. Valeurs acceptees : active, suspendue.');
    }

    const boutique = await Boutique.findByPk(id);

    if (!boutique) {
      return reponseErreur(res, 404, 'Boutique non trouvee.');
    }

    await boutique.update({ statut });

    return reponseSucces(res, 200, `Statut de la boutique modifie en "${statut}".`, boutique);
  } catch (erreur) {
    return reponseErreur(res, 500, 'Erreur lors de la modification du statut de la boutique.');
  }
};

module.exports = {
  creer,
  lister,
  detail,
  modifier,
  modifierStatut,
};
