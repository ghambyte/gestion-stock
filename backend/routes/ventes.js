const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const venteControleur = require('../controllers/venteControleur');
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

// POST / - Creer une vente
router.post(
  '/',
  authentification,
  boutiqueScopee,
  [
    body('lignes')
      .isArray({ min: 1 }).withMessage('Les lignes de vente sont requises et doivent etre un tableau non vide.'),
    body('typeVente')
      .notEmpty().withMessage('Le type de vente est requis.')
      .isIn(['comptant', 'echeance']).withMessage('Le type de vente doit etre "comptant" ou "echeance".'),
    validerRequete,
  ],
  venteControleur.creer
);

// GET / - Lister les ventes
router.get('/', authentification, boutiqueScopee, venteControleur.lister);

// GET /:id - Detail d'une vente
router.get('/:id', authentification, boutiqueScopee, venteControleur.detail);

// PUT /:id/annuler - Annuler une vente
router.put('/:id/annuler', authentification, boutiqueScopee, venteControleur.annuler);

module.exports = router;
