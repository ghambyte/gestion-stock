const express = require('express');
const router = express.Router({ mergeParams: true });
const tableauDeBordControleur = require('../controllers/tableauDeBordControleur');
const authentification = require('../middlewares/authentification');
const boutiqueScopee = require('../middlewares/boutiqueScopee');

// GET /resume - Resume du tableau de bord
router.get('/resume', authentification, boutiqueScopee, tableauDeBordControleur.resume);

// GET /revenus - Revenus groupes par periode
router.get('/revenus', authentification, boutiqueScopee, tableauDeBordControleur.revenus);

// GET /meilleurs-produits - Top 10 produits
router.get('/meilleurs-produits', authentification, boutiqueScopee, tableauDeBordControleur.meilleursProducts);

// GET /alertes - Alertes stock et echeances
router.get('/alertes', authentification, boutiqueScopee, tableauDeBordControleur.alertes);

module.exports = router;
