import api from './api'

const base = (boutiqueId) => `/boutiques/${boutiqueId}/paiements`

export const enregistrerPaiement = (boutiqueId, venteId, donnees) => api.post(`${base(boutiqueId)}/ventes/${venteId}`, donnees)
export const listerPaiements = (boutiqueId, params) => api.get(base(boutiqueId), { params })
export const recouvrements = (boutiqueId) => api.get(`${base(boutiqueId)}/recouvrements`)
export const clientsEnRetard = (boutiqueId) => api.get(`${base(boutiqueId)}/recouvrements/clients-en-retard`)
