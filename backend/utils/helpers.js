const formaterMontant = (montant, devise = 'FCFA') => {
  const nombre = parseFloat(montant);
  return `${nombre.toLocaleString('fr-FR')} ${devise}`;
};

const calculerPagination = (page, limite) => {
  const pageActuelle = Math.max(1, parseInt(page) || 1);
  const limiteParPage = Math.min(100, Math.max(1, parseInt(limite) || 20));
  const offset = (pageActuelle - 1) * limiteParPage;
  return { pageActuelle, limiteParPage, offset };
};

const construirePagination = (pageActuelle, limiteParPage, total) => {
  return {
    page: pageActuelle,
    limite: limiteParPage,
    total,
    totalPages: Math.ceil(total / limiteParPage),
  };
};

module.exports = { formaterMontant, calculerPagination, construirePagination };
