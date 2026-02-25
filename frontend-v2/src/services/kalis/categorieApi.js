import api from './api'

const base = (boutiqueId) => `/boutiques/${boutiqueId}/categories`

export const creerCategorie = (boutiqueId, donnees) => api.post(base(boutiqueId), donnees)
export const listerCategories = (boutiqueId) => api.get(base(boutiqueId))
export const modifierCategorie = (boutiqueId, id, donnees) => api.put(`${base(boutiqueId)}/${id}`, donnees)
export const supprimerCategorie = (boutiqueId, id) => api.delete(`${base(boutiqueId)}/${id}`)
