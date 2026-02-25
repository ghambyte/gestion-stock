import api from './api'

export const inscription = (donnees) => api.post('/auth/inscription', donnees)
export const connexion = (donnees) => api.post('/auth/connexion', donnees)
export const getProfil = () => api.get('/auth/profil')
export const modifierProfil = (donnees) => api.put('/auth/profil', donnees)
export const modifierMotDePasse = (donnees) => api.put('/auth/mot-de-passe/modifier', donnees)
