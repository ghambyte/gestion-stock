import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'

const useNavigationConfig = () => {
    const location = useLocation()

    const navigationTree = useMemo(() => {
        const match = location.pathname.match(/^\/boutiques\/(\d+)/)
        const boutiqueId = match ? match[1] : null
        if (!boutiqueId) return []

        const prefix = `/boutiques/${boutiqueId}`

        return [
            {
                key: 'tableauDeBord',
                path: `${prefix}/tableau-de-bord`,
                title: 'Tableau de bord',
                icon: 'tableauDeBord',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'produits',
                path: `${prefix}/produits`,
                title: 'Produits',
                icon: 'produits',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'categories',
                path: `${prefix}/categories`,
                title: 'Catégories',
                icon: 'categories',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'clients',
                path: `${prefix}/clients`,
                title: 'Clients',
                icon: 'clients',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'ventes',
                path: `${prefix}/ventes`,
                title: 'Ventes',
                icon: 'ventes',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'paiements',
                path: `${prefix}/paiements`,
                title: 'Paiements',
                icon: 'paiements',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'recouvrements',
                path: `${prefix}/recouvrements`,
                title: 'Recouvrements',
                icon: 'recouvrements',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ]
    }, [location.pathname])

    return navigationTree
}

export default useNavigationConfig
