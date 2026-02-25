const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const boutiqueControleur = require('../controllers/boutiqueControleur');
const authentification = require('../middlewares/authentification');
const autorisation = require('../middlewares/autorisation');

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

// POST / - Creer une boutique
router.post(
  '/',
  authentification,
  [
    body('nom')
      .notEmpty().withMessage('Le nom de la boutique est requis.')
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres.'),
    body('adresse')
      .optional()
      .isLength({ max: 255 }).withMessage('L\'adresse ne doit pas depasser 255 caracteres.'),
    body('telephone')
      .optional()
      .isLength({ max: 20 }).withMessage('Le telephone ne doit pas depasser 20 caracteres.'),
    body('devise')
      .optional()
      .isLength({ max: 10 }).withMessage('La devise ne doit pas depasser 10 caracteres.'),
    validerRequete,
  ],
  boutiqueControleur.creer
);

// GET / - Lister les boutiques
router.get('/', authentification, boutiqueControleur.lister);

// GET /:id - Detail d'une boutique
router.get('/:id', authentification, boutiqueControleur.detail);

// PUT /:id - Modifier une boutique
router.put(
  '/:id',
  authentification,
  [
    body('nom')
      .optional()
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres.'),
    body('adresse')
      .optional()
      .isLength({ max: 255 }).withMessage('L\'adresse ne doit pas depasser 255 caracteres.'),
    body('telephone')
      .optional()
      .isLength({ max: 20 }).withMessage('Le telephone ne doit pas depasser 20 caracteres.'),
    body('devise')
      .optional()
      .isLength({ max: 10 }).withMessage('La devise ne doit pas depasser 10 caracteres.'),
    validerRequete,
  ],
  boutiqueControleur.modifier
);

// PUT /:id/statut - Modifier le statut d'une boutique (super_admin uniquement)
router.put(
  '/:id/statut',
  authentification,
  autorisation('super_admin'),
  [
    body('statut')
      .notEmpty().withMessage('Le statut est requis.')
      .isIn(['active', 'suspendue']).withMessage('Statut invalide. Valeurs acceptees : active, suspendue.'),
    validerRequete,
  ],
  boutiqueControleur.modifierStatut
);

module.exports = router;
