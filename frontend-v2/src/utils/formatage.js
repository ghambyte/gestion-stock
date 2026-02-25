export const formaterMontant = (montant, devise = 'FCFA') => {
    const nombre = parseFloat(montant) || 0
    return `${nombre.toLocaleString('fr-FR')} ${devise}`
}

export const formaterDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export const formaterDateTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
