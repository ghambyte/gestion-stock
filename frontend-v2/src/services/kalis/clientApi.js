import api from './api'

const base = (boutiqueId) => `/boutiques/${boutiqueId}/clients`

export const creerClient = (boutiqueId, donnees) => api.post(base(boutiqueId), donnees)
export const listerClients = (boutiqueId, params) => api.get(base(boutiqueId), { params })
export const detailClient = (boutiqueId, id) => api.get(`${base(boutiqueId)}/${id}`)
export const modifierClient = (boutiqueId, id, donnees) => api.put(`${base(boutiqueId)}/${id}`, donnees)
export const supprimerClient = (boutiqueId, id) => api.delete(`${base(boutiqueId)}/${id}`)
