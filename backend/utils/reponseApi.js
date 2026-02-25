const reponseSucces = (res, statusCode, message, donnees = null) => {
  const reponse = { succes: true, message };
  if (donnees !== null) {
    reponse.donnees = donnees;
  }
  return res.status(statusCode).json(reponse);
};

const reponseErreur = (res, statusCode, message, erreurs = null) => {
  const reponse = { succes: false, message };
  if (erreurs) {
    reponse.erreurs = erreurs;
  }
  return res.status(statusCode).json(reponse);
};

const reponsePaginee = (res, statusCode, message, donnees, pagination) => {
  return res.status(statusCode).json({
    succes: true,
    message,
    donnees,
    pagination,
  });
};

module.exports = { reponseSucces, reponseErreur, reponsePaginee };
