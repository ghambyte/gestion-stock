const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const clientControleur = require('../controllers/clientControleur');
const authentification = require('../middlewares/authentification');
const boutiqueScopee = require('../middlewares/boutiqueScopee');

// Middleware de validation des requetes
const validerRequete = (req, res, next) => {
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    return res.status(400).json({
      succes: false,
      message: 'Erreurs de validation',
      erreurs: erreurs.array(),
    });
  }
  next();
};

// POST / - Creer un client
router.post(
  '/',
  authentification,
  boutiqueScopee,
  [
    body('nom')
      .notEmpty().withMessage('Le nom du client est requis.'),
    validerRequete,
  ],
  clientControleur.creer
);

// GET / - Lister les clients
router.get('/', authentification, boutiqueScopee, clientControleur.lister);

// GET /:id - Detail d'un client
router.get('/:id', authentification, boutiqueScopee, clientControleur.detail);

// PUT /:id - Modifier un client
router.put('/:id', authentification, boutiqueScopee, clientControleur.modifier);

// DELETE /:id - Supprimer un client
router.delete('/:id', authentification, boutiqueScopee, clientControleur.supprimer);

module.exports = router;
