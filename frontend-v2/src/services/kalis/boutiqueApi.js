import api from './api'

export const creerBoutique = (donnees) => api.post('/boutiques', donnees)
export const listerBoutiques = () => api.get('/boutiques')
export const detailBoutique = (id) => api.get(`/boutiques/${id}`)
export const modifierBoutique = (id, donnees) => api.put(`/boutiques/${id}`, donnees)
