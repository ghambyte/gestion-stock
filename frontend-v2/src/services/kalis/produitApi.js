import api from './api'

const base = (boutiqueId) => `/boutiques/${boutiqueId}/produits`

export const creerProduit = (boutiqueId, donnees) => api.post(base(boutiqueId), donnees)
export const listerProduits = (boutiqueId, params) => api.get(base(boutiqueId), { params })
export const detailProduit = (boutiqueId, id) => api.get(`${base(boutiqueId)}/${id}`)
export const modifierProduit = (boutiqueId, id, donnees) => api.put(`${base(boutiqueId)}/${id}`, donnees)
export const supprimerProduit = (boutiqueId, id) => api.delete(`${base(boutiqueId)}/${id}`)
export const uploaderImage = (boutiqueId, id, formData) => api.post(`${base(boutiqueId)}/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const alertesStock = (boutiqueId) => api.get(`${base(boutiqueId)}/alertes`)
export const ajusterStock = (boutiqueId, id, donnees) => api.post(`${base(boutiqueId)}/${id}/stock`, donnees)
export const mouvementsStock = (boutiqueId, id, params) => api.get(`${base(boutiqueId)}/${id}/mouvements`, { params })
