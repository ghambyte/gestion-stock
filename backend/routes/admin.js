const express = require('express');
const router = express.Router();
const authentification = require('../middlewares/authentification');
const autorisation = require('../middlewares/autorisation');

// GET /tableau-de-bord - Placeholder pour le tableau de bord admin
router.get(
  '/tableau-de-bord',
  authentification,
  autorisation('super_admin'),
  (req, res) => {
    return res.status(200).json({
      succes: true,
      message: 'Tableau de bord admin',
    });
  }
);

module.exports = router;
