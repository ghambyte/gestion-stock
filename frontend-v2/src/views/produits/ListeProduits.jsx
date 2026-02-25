import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import Pagination from '@/components/ui/Pagination'
import Loading from '@/components/shared/Loading'
import { formaterMontant } from '@/utils/formatage'
import { listerProduits } from '@/services/kalis/produitApi'
import { listerCategories } from '@/services/kalis/categorieApi'

const LIMITE = 20

const ListeProduits = () => {
    const { boutiqueId } = useParams()
    const navigate = useNavigate()

    const [chargement, setChargement] = useState(true)
    const [produits, setProduits] = useState([])
    const [pagination, setPagination] = useState({})
    const [page, setPage] = useState(1)
    const [recherche, setRecherche] = useState('')
    const [categorieId, setCategorieId] = useState(null)
    const [categories, setCategories] = useState([])

    const chargerCategories = useCallback(async () => {
        try {
            const resp = await listerCategories(boutiqueId)
            const cats = resp.data.donnees || []
            setCategories(
                cats.map((c) => ({ value: c._id || c.id, label: c.nom })),
            )
        } catch (err) {
            console.error('Erreur chargement categories:', err)
        }
    }, [boutiqueId])

    const chargerProduits = useCallback(async () => {
        try {
            setChargement(true)
            const params = {
                page,
                limite: LIMITE,
            }
            if (recherche) params.recherche = recherche
            if (categorieId) params.categorieId = categorieId

            const resp = await listerProduits(boutiqueId, params)
            setProduits(resp.data.donnees || [])
            setPagination(resp.data.pagination || {})
        } catch (err) {
            console.error('Erreur chargement produits:', err)
        } finally {
            setChargement(false)
        }
    }, [boutiqueId, page, recherche, categorieId])

    useEffect(() => {
        if (boutiqueId) {
            chargerCategories()
        }
    }, [boutiqueId, chargerCategories])

    useEffect(() => {
        if (boutiqueId) {
            chargerProduits()
        }
    }, [boutiqueId, chargerProduits])

    const handleRecherche = (e) => {
        setRecherche(e.target.value)
        setPage(1)
    }

    const handleCategorieChange = (option) => {
        setCategorieId(option ? option.value : null)
        setPage(1)
    }

    const handlePageChange = (nouvellePage) => {
        setPage(nouvellePage)
    }

    const renderStockTag = (produit) => {
        const estBas =
            produit.quantiteStock <= (produit.seuilAlerte || 0)
        return (
            <Tag
                className={
                    estBas
                        ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-400/20'
                        : 'bg-green-100 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/20'
                }
            >
                {produit.quantiteStock}
            </Tag>
        )
    }

    const totalPages = pagination.totalPages || Math.ceil((pagination.total || 0) / LIMITE)

    return (
        <div>
            {/* En-tete */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Produits</h2>
                <Link to="nouveau">
                    <Button variant="solid">Nouveau Produit</Button>
                </Link>
            </div>

            {/* Filtres */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        placeholder="Rechercher un produit..."
                        value={recherche}
                        onChange={handleRecherche}
                    />
                    <Select
                        placeholder="Filtrer par categorie"
                        options={categories}
                        value={
                            categories.find((c) => c.value === categorieId) ||
                            null
                        }
                        onChange={handleCategorieChange}
                        isClearable
                    />
                </div>
            </Card>

            {/* Tableau */}
            <Card>
                <Loading loading={chargement}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold">
                                        Nom
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold">
                                        Categorie
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Prix Achat
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Prix Vente
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold">
                                        Stock
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold">
                                        Statut
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {produits.length > 0 ? (
                                    produits.map((produit) => (
                                        <tr
                                            key={produit._id || produit.id}
                                            className="border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            onClick={() =>
                                                navigate(
                                                    `${produit._id || produit.id}`,
                                                )
                                            }
                                        >
                                            <td className="py-3 px-4 font-medium">
                                                {produit.nom}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {produit.categorie?.nom ||
                                                    produit.categorieNom ||
                                                    '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {formaterMontant(
                                                    produit.prixAchat,
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {formaterMontant(
                                                    produit.prixVente,
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {renderStockTag(produit)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Tag
                                                    className={
                                                        produit.statut ===
                                                        'actif'
                                                            ? 'bg-green-100 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/20'
                                                            : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500'
                                                    }
                                                >
                                                    {produit.statut || 'actif'}
                                                </Tag>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Aucun produit trouve
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-end mt-4">
                            <Pagination
                                currentPage={page}
                                total={pagination.total || produits.length}
                                pageSize={LIMITE}
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </Loading>
            </Card>
        </div>
    )
}

export default ListeProduits
