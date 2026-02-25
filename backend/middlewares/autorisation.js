const autorisation = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'Authentification requise.',
      });
    }

    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({
        succes: false,
        message: 'Vous n\'avez pas les droits necessaires pour cette action.',
      });
    }

    next();
  };
};

module.exports = autorisation;
