import api from './api'

const base = (boutiqueId) => `/boutiques/${boutiqueId}/ventes`

export const creerVente = (boutiqueId, donnees) => api.post(base(boutiqueId), donnees)
export const listerVentes = (boutiqueId, params) => api.get(base(boutiqueId), { params })
export const detailVente = (boutiqueId, id) => api.get(`${base(boutiqueId)}/${id}`)
export const annulerVente = (boutiqueId, id) => api.put(`${base(boutiqueId)}/${id}/annuler`)
