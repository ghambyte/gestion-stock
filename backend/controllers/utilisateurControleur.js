const { Utilisateur, Boutique } = require('../models');
const { reponseSucces, reponseErreur, reponsePaginee } = require('../utils/reponseApi');
const { calculerPagination, construirePagination } = require('../utils/helpers');

// GET / - Lister tous les utilisateurs avec pagination
const listerUtilisateurs = async (req, res) => {
  try {
    const { page, limite } = req.query;
    const { pageActuelle, limiteParPage, offset } = calculerPagination(page, limite);

    const { count, rows: utilisateurs } = await Utilisateur.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: limiteParPage,
      offset,
    });

    const pagination = construirePagination(pageActuelle, limiteParPage, count);

    return reponsePaginee(res, 200, 'Liste des utilisateurs recuperee avec succes.', utilisateurs, pagination);
  } catch (erreur) {
    console.error('Erreur liste utilisateurs:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la recuperation des utilisateurs.', erreur.message);
  }
};

// GET /:id - Detail d'un utilisateur avec ses boutiques
const detailUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id, {
      include: [
        {
          model: Boutique,
          as: 'boutiques',
        },
      ],
    });

    if (!utilisateur) {
      return reponseErreur(res, 404, 'Utilisateur non trouve.');
    }

    return reponseSucces(res, 200, 'Detail de l\'utilisateur recupere avec succes.', {
      utilisateur,
    });
  } catch (erreur) {
    console.error('Erreur detail utilisateur:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la recuperation de l\'utilisateur.', erreur.message);
  }
};

// PUT /:id/statut - Modifier le statut (activer/desactiver) d'un utilisateur
const modifierStatut = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return reponseErreur(res, 404, 'Utilisateur non trouve.');
    }

    // Empecher la modification d'un super_admin
    if (utilisateur.role === 'super_admin') {
      return reponseErreur(res, 403, 'Impossible de modifier le statut d\'un super administrateur.');
    }

    // Basculer le statut
    await utilisateur.update({ estActif: !utilisateur.estActif });

    const message = utilisateur.estActif
      ? 'Utilisateur active avec succes.'
      : 'Utilisateur desactive avec succes.';

    return reponseSucces(res, 200, message, {
      utilisateur,
    });
  } catch (erreur) {
    console.error('Erreur modification statut:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la modification du statut.', erreur.message);
  }
};

module.exports = {
  listerUtilisateurs,
  detailUtilisateur,
  modifierStatut,
};
