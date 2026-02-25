import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Dialog from '@/components/ui/Dialog'
import Loading from '@/components/shared/Loading'
import { detailClient, supprimerClient } from '@/services/kalis/clientApi'
import { formaterMontant, formaterDate } from '@/utils/formatage'
import { STATUTS_VENTE, TYPES_VENTE } from '@/utils/constantes'
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'

const statutColors = {
    [STATUTS_VENTE.COMPLETEE]: 'green',
    [STATUTS_VENTE.EN_COURS]: 'yellow',
    [STATUTS_VENTE.ANNULEE]: 'red',
}

const statutLabels = {
    [STATUTS_VENTE.COMPLETEE]: 'Complétée',
    [STATUTS_VENTE.EN_COURS]: 'En cours',
    [STATUTS_VENTE.ANNULEE]: 'Annulée',
}

const typeLabels = {
    [TYPES_VENTE.COMPTANT]: 'Comptant',
    [TYPES_VENTE.ECHEANCE]: 'Échéance',
}

const DetailClient = () => {
    const { boutiqueId, id } = useParams()
    const navigate = useNavigate()

    const [client, setClient] = useState(null)
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')
    const [dialogSuppression, setDialogSuppression] = useState(false)
    const [suppression, setSuppression] = useState(false)

    useEffect(() => {
        chargerClient()
    }, [id])

    const chargerClient = async () => {
        try {
            const resp = await detailClient(boutiqueId, id)
            setClient(resp.data.donnees)
        } catch {
            setErreur('Impossible de charger les données du client')
        } finally {
            setChargement(false)
        }
    }

    const handleSupprimer = async () => {
        setSuppression(true)
        try {
            await supprimerClient(boutiqueId, id)
            navigate(`/boutiques/${boutiqueId}/clients`)
        } catch {
            setErreur('Erreur lors de la suppression du client')
            setDialogSuppression(false)
        } finally {
            setSuppression(false)
        }
    }

    if (chargement) {
        return <Loading loading={true} />
    }

    if (erreur && !client) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {erreur}
            </div>
        )
    }

    if (!client) return null

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate(`/boutiques/${boutiqueId}/clients`)}
                    />
                    <h2 className="text-2xl font-bold">{client.nom}</h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<HiOutlinePencil />}
                        onClick={() => navigate(`/boutiques/${boutiqueId}/clients/${id}/modifier`)}
                    >
                        Modifier
                    </Button>
                    <Button
                        variant="plain"
                        size="sm"
                        color="red"
                        icon={<HiOutlineTrash />}
                        onClick={() => setDialogSuppression(true)}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>

            {erreur && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Nom</p>
                        <p className="font-medium">{client.nom}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                        <p className="font-medium">{client.telephone || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium">{client.email || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Adresse</p>
                        <p className="font-medium">{client.adresse || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total achats</p>
                        <p className="font-medium text-lg">{formaterMontant(client.totalAchats)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Encours</p>
                        <p className="font-medium text-lg text-amber-600">
                            {formaterMontant(client.encours)}
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <h4 className="font-bold text-lg mb-4">Historique des achats</h4>
                {(!client.ventes || client.ventes.length === 0) ? (
                    <div className="text-center py-6 text-gray-500">
                        Aucun achat enregistré
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Montant</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Payé</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.ventes.map((vente) => (
                                    <tr
                                        key={vente.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        onClick={() => navigate(`/boutiques/${boutiqueId}/ventes/${vente.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            {formaterDate(vente.date || vente.createdAt)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Tag className="capitalize">
                                                {typeLabels[vente.typeVente] || vente.typeVente}
                                            </Tag>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formaterMontant(vente.montant || vente.montantTotal)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {formaterMontant(vente.montantPaye)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Tag
                                                prefix
                                                prefixClass={`bg-${statutColors[vente.statut] || 'gray'}-500`}
                                            >
                                                {statutLabels[vente.statut] || vente.statut}
                                            </Tag>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Dialog
                isOpen={dialogSuppression}
                onClose={() => setDialogSuppression(false)}
                onRequestClose={() => setDialogSuppression(false)}
            >
                <h5 className="mb-4">Confirmer la suppression</h5>
                <p className="mb-6">
                    Êtes-vous sûr de vouloir supprimer le client <strong>{client.nom}</strong> ?
                    Cette action est irréversible.
                </p>
                <div className="text-right">
                    <Button
                        className="mr-2"
                        variant="plain"
                        onClick={() => setDialogSuppression(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="solid"
                        color="red"
                        loading={suppression}
                        onClick={handleSupprimer}
                    >
                        Supprimer
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default DetailClient
