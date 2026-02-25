const express = require('express');
const router = express.Router();
const utilisateurControleur = require('../controllers/utilisateurControleur');
const authentification = require('../middlewares/authentification');
const autorisation = require('../middlewares/autorisation');

// GET / - Lister tous les utilisateurs (super_admin uniquement)
router.get(
  '/',
  authentification,
  autorisation('super_admin'),
  utilisateurControleur.listerUtilisateurs
);

// GET /:id - Detail d'un utilisateur (super_admin uniquement)
router.get(
  '/:id',
  authentification,
  autorisation('super_admin'),
  utilisateurControleur.detailUtilisateur
);

// PUT /:id/statut - Modifier le statut d'un utilisateur (super_admin uniquement)
router.put(
  '/:id/statut',
  authentification,
  autorisation('super_admin'),
  utilisateurControleur.modifierStatut
);

module.exports = router;
