const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const produitControleur = require('../controllers/produitControleur');
const authentification = require('../middlewares/authentification');
const boutiqueScopee = require('../middlewares/boutiqueScopee');
const upload = require('../middlewares/upload');

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

// POST / - Creer un produit
router.post(
  '/',
  authentification,
  boutiqueScopee,
  [
    body('nom')
      .notEmpty().withMessage('Le nom du produit est requis.'),
    body('prixVente')
      .notEmpty().withMessage('Le prix de vente est requis.')
      .isNumeric().withMessage('Le prix de vente doit etre un nombre.'),
    body('etat')
      .optional()
      .isIn(['neuf_scelle', 'neuf_non_scelle', 'seconde_main']).withMessage('Etat invalide.'),
    body('sousEtat')
      .optional()
      .isIn(['excellent', 'bon', 'moyen', 'passable']).withMessage('Sous-etat invalide.'),
    validerRequete,
  ],
  produitControleur.creer
);

// GET / - Lister les produits d'une boutique
router.get('/', authentification, boutiqueScopee, produitControleur.lister);

// GET /alertes - Produits en alerte de stock (AVANT /:id)
router.get('/alertes', authentification, boutiqueScopee, produitControleur.alertesStock);

// GET /:id - Detail d'un produit
router.get('/:id', authentification, boutiqueScopee, produitControleur.detail);

// PUT /:id - Modifier un produit
router.put('/:id', authentification, boutiqueScopee, produitControleur.modifier);

// DELETE /:id - Supprimer un produit
router.delete('/:id', authentification, boutiqueScopee, produitControleur.supprimer);

// POST /:id/image - Uploader une image
router.post('/:id/image', authentification, boutiqueScopee, upload.single('image'), produitControleur.uploaderImage);

// POST /:id/stock - Ajuster le stock
router.post(
  '/:id/stock',
  authentification,
  boutiqueScopee,
  [
    body('type')
      .notEmpty().withMessage('Le type de mouvement est requis.'),
    body('quantite')
      .notEmpty().withMessage('La quantite est requise.'),
    validerRequete,
  ],
  produitControleur.ajusterStock
);

// GET /:id/mouvements - Mouvements de stock d'un produit
router.get('/:id/mouvements', authentification, boutiqueScopee, produitControleur.mouvementsStock);

module.exports = router;
