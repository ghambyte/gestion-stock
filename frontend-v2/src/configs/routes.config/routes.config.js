import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'

export const publicRoutes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'boutiques',
        path: '/boutiques',
        component: lazy(() => import('@/views/boutiques/ListeBoutiques')),
        authority: [],
        meta: {
            layout: 'blank',
        },
    },
    {
        key: 'tableauDeBord',
        path: '/boutiques/:boutiqueId/tableau-de-bord',
        component: lazy(() => import('@/views/tableauDeBord/TableauDeBord')),
        authority: [],
    },
    {
        key: 'produits',
        path: '/boutiques/:boutiqueId/produits',
        component: lazy(() => import('@/views/produits/ListeProduits')),
        authority: [],
    },
    {
        key: 'produits.nouveau',
        path: '/boutiques/:boutiqueId/produits/nouveau',
        component: lazy(() => import('@/views/produits/FormulaireProduit')),
        authority: [],
    },
    {
        key: 'produits.detail',
        path: '/boutiques/:boutiqueId/produits/:id',
        component: lazy(() => import('@/views/produits/DetailProduit')),
        authority: [],
    },
    {
        key: 'produits.modifier',
        path: '/boutiques/:boutiqueId/produits/:id/modifier',
        component: lazy(() => import('@/views/produits/FormulaireProduit')),
        authority: [],
    },
    {
        key: 'categories',
        path: '/boutiques/:boutiqueId/categories',
        component: lazy(() => import('@/views/categories/GestionCategories')),
        authority: [],
    },
    {
        key: 'clients',
        path: '/boutiques/:boutiqueId/clients',
        component: lazy(() => import('@/views/clients/ListeClients')),
        authority: [],
    },
    {
        key: 'clients.nouveau',
        path: '/boutiques/:boutiqueId/clients/nouveau',
        component: lazy(() => import('@/views/clients/FormulaireClient')),
        authority: [],
    },
    {
        key: 'clients.detail',
        path: '/boutiques/:boutiqueId/clients/:id',
        component: lazy(() => import('@/views/clients/DetailClient')),
        authority: [],
    },
    {
        key: 'clients.modifier',
        path: '/boutiques/:boutiqueId/clients/:id/modifier',
        component: lazy(() => import('@/views/clients/FormulaireClient')),
        authority: [],
    },
    {
        key: 'ventes',
        path: '/boutiques/:boutiqueId/ventes',
        component: lazy(() => import('@/views/ventes/ListeVentes')),
        authority: [],
    },
    {
        key: 'ventes.nouvelle',
        path: '/boutiques/:boutiqueId/ventes/nouvelle',
        component: lazy(() => import('@/views/ventes/NouvelleVente')),
        authority: [],
    },
    {
        key: 'ventes.detail',
        path: '/boutiques/:boutiqueId/ventes/:id',
        component: lazy(() => import('@/views/ventes/DetailVente')),
        authority: [],
    },
    {
        key: 'paiements',
        path: '/boutiques/:boutiqueId/paiements',
        component: lazy(() => import('@/views/paiements/ListePaiements')),
        authority: [],
    },
    {
        key: 'recouvrements',
        path: '/boutiques/:boutiqueId/recouvrements',
        component: lazy(() => import('@/views/paiements/TableauRecouvrements')),
        authority: [],
    },
    ...othersRoute,
]
