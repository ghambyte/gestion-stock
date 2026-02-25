const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authControleur = require('../controllers/authControleur');
const authentification = require('../middlewares/authentification');

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

// POST /inscription
router.post(
  '/inscription',
  [
    body('nom')
      .notEmpty().withMessage('Le nom est requis.')
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres.'),
    body('email')
      .notEmpty().withMessage('L\'email est requis.')
      .isEmail().withMessage('Email invalide.'),
    body('motDePasse')
      .notEmpty().withMessage('Le mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres.'),
    body('telephone')
      .optional()
      .isMobilePhone().withMessage('Numero de telephone invalide.'),
    validerRequete,
  ],
  authControleur.inscription
);

// POST /connexion
router.post(
  '/connexion',
  [
    body('email')
      .notEmpty().withMessage('L\'email est requis.')
      .isEmail().withMessage('Email invalide.'),
    body('motDePasse')
      .notEmpty().withMessage('Le mot de passe est requis.'),
    validerRequete,
  ],
  authControleur.connexion
);

// GET /profil
router.get('/profil', authentification, authControleur.profil);

// PUT /profil
router.put(
  '/profil',
  authentification,
  [
    body('nom')
      .optional()
      .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caracteres.'),
    body('telephone')
      .optional()
      .isMobilePhone().withMessage('Numero de telephone invalide.'),
    validerRequete,
  ],
  authControleur.modifierProfil
);

// PUT /mot-de-passe/modifier
router.put(
  '/mot-de-passe/modifier',
  authentification,
  [
    body('ancienMotDePasse')
      .notEmpty().withMessage('L\'ancien mot de passe est requis.'),
    body('nouveauMotDePasse')
      .notEmpty().withMessage('Le nouveau mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caracteres.'),
    validerRequete,
  ],
  authControleur.modifierMotDePasse
);

module.exports = router;
