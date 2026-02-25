const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const categorieControleur = require('../controllers/categorieControleur');
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

// POST / - Creer une categorie
router.post(
  '/',
  authentification,
  boutiqueScopee,
  [
    body('nom')
      .notEmpty().withMessage('Le nom de la categorie est requis.')
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres.'),
    body('description')
      .optional()
      .isString().withMessage('La description doit etre une chaine de caracteres.'),
    validerRequete,
  ],
  categorieControleur.creer
);

// GET / - Lister les categories d'une boutique
router.get('/', authentification, boutiqueScopee, categorieControleur.lister);

// PUT /:id - Modifier une categorie
router.put(
  '/:id',
  authentification,
  boutiqueScopee,
  [
    body('nom')
      .optional()
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres.'),
    body('description')
      .optional()
      .isString().withMessage('La description doit etre une chaine de caracteres.'),
    validerRequete,
  ],
  categorieControleur.modifier
);

// DELETE /:id - Supprimer une categorie
router.delete('/:id', authentification, boutiqueScopee, categorieControleur.supprimer);

module.exports = router;
