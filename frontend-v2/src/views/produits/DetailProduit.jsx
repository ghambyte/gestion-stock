import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { formaterMontant, formaterDateTime } from '@/utils/formatage'
import {
    detailProduit,
    supprimerProduit,
    ajusterStock,
    mouvementsStock,
} from '@/services/kalis/produitApi'

const typeMouvementOptions = [
    { value: 'entree', label: 'Entree' },
    { value: 'ajustement', label: 'Ajustement' },
]

const DetailProduit = () => {
    const { boutiqueId, id } = useParams()
    const navigate = useNavigate()

    const [chargement, setChargement] = useState(true)
    const [produit, setProduit] = useState(null)
    const [mouvements, setMouvements] = useState([])

    // Dialog ajustement stock
    const [dialogAjustement, setDialogAjustement] = useState(false)
    const [ajustementType, setAjustementType] = useState(null)
    const [ajustementQuantite, setAjustementQuantite] = useState('')
    const [ajustementMotif, setAjustementMotif] = useState('')
    const [soumissionAjustement, setSoumissionAjustement] = useState(false)

    // Dialog suppression
    const [dialogSuppression, setDialogSuppression] = useState(false)
    const [soumissionSuppression, setSoumissionSuppression] = useState(false)

    const chargerProduit = useCallback(async () => {
        try {
            setChargement(true)
            const resp = await detailProduit(boutiqueId, id)
            setProduit(resp.data.donnees)
        } catch (err) {
            console.error('Erreur chargement produit:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    Impossible de charger le produit.
                </Notification>,
            )
        } finally {
            setChargement(false)
        }
    }, [boutiqueId, id])

    const chargerMouvements = useCallback(async () => {
        try {
            const resp = await mouvementsStock(boutiqueId, id)
            setMouvements(resp.data.donnees || [])
        } catch (err) {
            console.error('Erreur chargement mouvements:', err)
        }
    }, [boutiqueId, id])

    useEffect(() => {
        if (boutiqueId && id) {
            chargerProduit()
            chargerMouvements()
        }
    }, [boutiqueId, id, chargerProduit, chargerMouvements])

    const ouvrirDialogAjustement = () => {
        setAjustementType(null)
        setAjustementQuantite('')
        setAjustementMotif('')
        setDialogAjustement(true)
    }

    const handleAjusterStock = async () => {
        if (!ajustementType || !ajustementQuantite) return

        try {
            setSoumissionAjustement(true)
            await ajusterStock(boutiqueId, id, {
                type: ajustementType.value,
                quantite: parseInt(ajustementQuantite, 10),
                motif: ajustementMotif,
            })
            toast.push(
                <Notification type="success" title="Succes">
                    Stock ajuste avec succes.
                </Notification>,
            )
            setDialogAjustement(false)
            chargerProduit()
            chargerMouvements()
        } catch (err) {
            console.error('Erreur ajustement stock:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err.response?.data?.message ||
                        'Erreur lors de l\'ajustement du stock.'}
                </Notification>,
            )
        } finally {
            setSoumissionAjustement(false)
        }
    }

    const handleSupprimer = async () => {
        try {
            setSoumissionSuppression(true)
            await supprimerProduit(boutiqueId, id)
            toast.push(
                <Notification type="success" title="Succes">
                    Produit supprime avec succes.
                </Notification>,
            )
            navigate(`/boutiques/${boutiqueId}/produits`)
        } catch (err) {
            console.error('Erreur suppression produit:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err.response?.data?.message ||
                        'Erreur lors de la suppression du produit.'}
                </Notification>,
            )
        } finally {
            setSoumissionSuppression(false)
            setDialogSuppression(false)
        }
    }

    const getTypeMouvementTag = (type) => {
        switch (type) {
            case 'entree':
                return (
                    <Tag className="bg-green-100 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/20">
                        Entree
                    </Tag>
                )
            case 'sortie':
                return (
                    <Tag className="bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-400/20">
                        Sortie
                    </Tag>
                )
            case 'ajustement':
                return (
                    <Tag className="bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-400/20">
                        Ajustement
                    </Tag>
                )
            default:
                return <Tag>{type}</Tag>
        }
    }

    if (chargement) {
        return <Loading loading={true} className="w-full h-96" />
    }

    if (!produit) {
        return (
            <div className="text-center py-12 text-gray-500">
                Produit introuvable.
            </div>
        )
    }

    const estStockBas =
        produit.quantiteStock <= (produit.seuilAlerte || 0)

    return (
        <div>
            {/* En-tete */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">{produit.nom}</h2>
                <div className="flex gap-3">
                    <Link to="modifier">
                        <Button>Modifier</Button>
                    </Link>
                    <Button onClick={ouvrirDialogAjustement}>
                        Ajuster Stock
                    </Button>
                    <Button
                        variant="solid"
                        className="bg-red-500 hover:bg-red-600 active:bg-red-600 text-white"
                        onClick={() => setDialogSuppression(true)}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Informations produit */}
            <Card className="mb-6" header={{ content: 'Informations' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Nom</p>
                        <p className="font-medium">{produit.nom}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Categorie
                        </p>
                        <p className="font-medium">
                            {produit.categorie?.nom ||
                                produit.categorieNom ||
                                '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Statut</p>
                        <Tag
                            className={
                                produit.statut === 'actif'
                                    ? 'bg-green-100 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/20'
                                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500'
                            }
                        >
                            {produit.statut || 'actif'}
                        </Tag>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Prix d'achat
                        </p>
                        <p className="font-medium">
                            {formaterMontant(produit.prixAchat)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Prix de vente
                        </p>
                        <p className="font-medium">
                            {formaterMontant(produit.prixVente)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Stock</p>
                        <Tag
                            className={
                                estStockBas
                                    ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-400/20'
                                    : 'bg-green-100 text-green-600 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/20'
                            }
                        >
                            {produit.quantiteStock}
                        </Tag>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Seuil d'alerte
                        </p>
                        <p className="font-medium">
                            {produit.seuilAlerte ?? '-'}
                        </p>
                    </div>
                    {produit.description && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <p className="text-sm text-gray-500 mb-1">
                                Description
                            </p>
                            <p className="font-medium">
                                {produit.description}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Mouvements de stock */}
            <Card header={{ content: 'Mouvements de stock' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                <th className="text-left py-3 px-4 font-semibold">
                                    Date
                                </th>
                                <th className="text-center py-3 px-4 font-semibold">
                                    Type
                                </th>
                                <th className="text-right py-3 px-4 font-semibold">
                                    Quantite
                                </th>
                                <th className="text-left py-3 px-4 font-semibold">
                                    Motif
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mouvements.length > 0 ? (
                                mouvements.map((mouvement, index) => (
                                    <tr
                                        key={
                                            mouvement._id ||
                                            mouvement.id ||
                                            index
                                        }
                                        className="border-b border-gray-100 dark:border-gray-700"
                                    >
                                        <td className="py-3 px-4">
                                            {formaterDateTime(
                                                mouvement.date ||
                                                    mouvement.createdAt,
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getTypeMouvementTag(
                                                mouvement.type,
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {mouvement.type === 'sortie'
                                                ? `-${mouvement.quantite}`
                                                : `+${mouvement.quantite}`}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {mouvement.motif || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Aucun mouvement de stock
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Dialog ajustement stock */}
            <Dialog
                isOpen={dialogAjustement}
                onClose={() => setDialogAjustement(false)}
                width={480}
            >
                <h4 className="text-lg font-bold mb-4">Ajuster le stock</h4>
                <div className="space-y-4">
                    <div>
                        <label className="form-label mb-2">Type</label>
                        <Select
                            placeholder="Selectionner le type"
                            options={typeMouvementOptions}
                            value={ajustementType}
                            onChange={(option) => setAjustementType(option)}
                        />
                    </div>
                    <div>
                        <label className="form-label mb-2">Quantite</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={ajustementQuantite}
                            onChange={(e) =>
                                setAjustementQuantite(e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label className="form-label mb-2">Motif</label>
                        <Input
                            textArea
                            rows={3}
                            placeholder="Motif de l'ajustement"
                            value={ajustementMotif}
                            onChange={(e) => setAjustementMotif(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => setDialogAjustement(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="solid"
                        loading={soumissionAjustement}
                        onClick={handleAjusterStock}
                        disabled={!ajustementType || !ajustementQuantite}
                    >
                        Confirmer
                    </Button>
                </div>
            </Dialog>

            {/* Dialog suppression */}
            <Dialog
                isOpen={dialogSuppression}
                onClose={() => setDialogSuppression(false)}
                width={420}
            >
                <h4 className="text-lg font-bold mb-4">
                    Confirmer la suppression
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                    Etes-vous sur de vouloir supprimer le produit{' '}
                    <span className="font-semibold">{produit.nom}</span> ?
                    Cette action est irreversible.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => setDialogSuppression(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="solid"
                        className="bg-red-500 hover:bg-red-600 active:bg-red-600 text-white"
                        loading={soumissionSuppression}
                        onClick={handleSupprimer}
                    >
                        Supprimer
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default DetailProduit
