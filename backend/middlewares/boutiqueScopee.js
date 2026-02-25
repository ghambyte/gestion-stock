const { Boutique } = require('../models');

const boutiqueScopee = async (req, res, next) => {
  try {
    const { boutiqueId } = req.params;

    if (!boutiqueId) {
      return res.status(400).json({
        succes: false,
        message: 'ID de boutique requis.',
      });
    }

    const boutique = await Boutique.findByPk(boutiqueId);

    if (!boutique) {
      return res.status(404).json({
        succes: false,
        message: 'Boutique non trouvee.',
      });
    }

    // Super admin a acces a toutes les boutiques
    if (req.utilisateur.role === 'super_admin') {
      req.boutique = boutique;
      return next();
    }

    // Vendeur : verifier qu'il est proprietaire
    if (boutique.utilisateurId !== req.utilisateur.id) {
      return res.status(403).json({
        succes: false,
        message: 'Vous n\'avez pas acces a cette boutique.',
      });
    }

    if (boutique.statut === 'suspendue') {
      return res.status(403).json({
        succes: false,
        message: 'Cette boutique est suspendue.',
      });
    }

    req.boutique = boutique;
    next();
  } catch (erreur) {
    return res.status(500).json({
      succes: false,
      message: 'Erreur lors de la verification de la boutique.',
    });
  }
};

module.exports = boutiqueScopee;
