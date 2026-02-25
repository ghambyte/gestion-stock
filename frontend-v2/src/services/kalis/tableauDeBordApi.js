import api from './api'

const base = (boutiqueId) => `/boutiques/${boutiqueId}/tableau-de-bord`

export const resume = (boutiqueId) => api.get(`${base(boutiqueId)}/resume`)
export const revenus = (boutiqueId, params) => api.get(`${base(boutiqueId)}/revenus`, { params })
export const meilleursProducts = (boutiqueId) => api.get(`${base(boutiqueId)}/meilleurs-produits`)
export const alertes = (boutiqueId) => api.get(`${base(boutiqueId)}/alertes`)
