const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const paiementControleur = require('../controllers/paiementControleur');
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

// IMPORTANT: Routes statiques avant routes parametrees

// GET /recouvrements - Vue d'ensemble des recouvrements
router.get('/recouvrements', authentification, boutiqueScopee, paiementControleur.recouvrements);

// GET /recouvrements/clients-en-retard - Clients en retard de paiement
router.get('/recouvrements/clients-en-retard', authentification, boutiqueScopee, paiementControleur.clientsEnRetard);

// GET / - Lister les paiements
router.get('/', authentification, boutiqueScopee, paiementControleur.listerPaiements);

// POST /ventes/:venteId - Enregistrer un paiement pour une vente
router.post(
  '/ventes/:venteId',
  authentification,
  boutiqueScopee,
  [
    body('montant')
      .notEmpty().withMessage('Le montant est requis.')
      .isNumeric().withMessage('Le montant doit etre un nombre.'),
    validerRequete,
  ],
  paiementControleur.enregistrerPaiement
);

module.exports = router;
