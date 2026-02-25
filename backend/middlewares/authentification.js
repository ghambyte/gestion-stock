const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

const authentification = async (req, res, next) => {
  try {
    const entete = req.headers.authorization;
    if (!entete || !entete.startsWith('Bearer ')) {
      return res.status(401).json({
        succes: false,
        message: 'Acces non autorise. Token manquant.',
      });
    }

    const token = entete.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const utilisateur = await Utilisateur.findByPk(decoded.id);
    if (!utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'Utilisateur non trouve.',
      });
    }

    if (!utilisateur.estActif) {
      return res.status(403).json({
        succes: false,
        message: 'Compte desactive. Contactez l\'administrateur.',
      });
    }

    req.utilisateur = utilisateur;
    next();
  } catch (erreur) {
    if (erreur.name === 'TokenExpiredError') {
      return res.status(401).json({
        succes: false,
        message: 'Token expire. Veuillez vous reconnecter.',
      });
    }
    return res.status(401).json({
      succes: false,
      message: 'Token invalide.',
    });
  }
};

module.exports = authentification;
