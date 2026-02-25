import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import { FormItem, Form } from '@/components/ui/Form'
import Loading from '@/components/shared/Loading'
import { detailVente, annulerVente } from '@/services/kalis/venteApi'
import { enregistrerPaiement } from '@/services/kalis/paiementApi'
import { formaterMontant, formaterDate, formaterDateTime } from '@/utils/formatage'
import { STATUTS_VENTE, TYPES_VENTE, STATUTS_ECHEANCE, MODES_PAIEMENT } from '@/utils/constantes'
import { HiOutlineArrowLeft, HiOutlineCash, HiOutlineBan } from 'react-icons/hi'

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

const echeanceStatutColors = {
    [STATUTS_ECHEANCE.PAYEE]: 'green',
    [STATUTS_ECHEANCE.EN_ATTENTE]: 'yellow',
    [STATUTS_ECHEANCE.EN_RETARD]: 'red',
}

const echeanceStatutLabels = {
    [STATUTS_ECHEANCE.PAYEE]: 'Payée',
    [STATUTS_ECHEANCE.EN_ATTENTE]: 'En attente',
    [STATUTS_ECHEANCE.EN_RETARD]: 'En retard',
}

const modeLabels = {
    [MODES_PAIEMENT.ESPECES]: 'Espèces',
    [MODES_PAIEMENT.MOBILE_MONEY]: 'Mobile Money',
    [MODES_PAIEMENT.VIREMENT]: 'Virement',
    [MODES_PAIEMENT.AUTRE]: 'Autre',
}

const optionsModesPaiement = [
    { value: MODES_PAIEMENT.ESPECES, label: 'Espèces' },
    { value: MODES_PAIEMENT.MOBILE_MONEY, label: 'Mobile Money' },
    { value: MODES_PAIEMENT.VIREMENT, label: 'Virement' },
]

const DetailVente = () => {
    const { boutiqueId, id } = useParams()
    const navigate = useNavigate()

    const [vente, setVente] = useState(null)
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')

    // Dialog paiement
    const [dialogPaiement, setDialogPaiement] = useState(false)
    const [paiementMontant, setPaiementMontant] = useState('')
    const [paiementMode, setPaiementMode] = useState(optionsModesPaiement[0])
    const [paiementNotes, setPaiementNotes] = useState('')
    const [soumissionPaiement, setSoumissionPaiement] = useState(false)

    // Dialog annulation
    const [dialogAnnulation, setDialogAnnulation] = useState(false)
    const [annulation, setAnnulation] = useState(false)

    useEffect(() => {
        chargerVente()
    }, [id])

    const chargerVente = async () => {
        try {
            const resp = await detailVente(boutiqueId, id)
            setVente(resp.data.donnees)
        } catch {
            setErreur('Impossible de charger les détails de la vente')
        } finally {
            setChargement(false)
        }
    }

    const handleEnregistrerPaiement = async (e) => {
        e.preventDefault()
        const montant = parseFloat(paiementMontant)
        if (!montant || montant <= 0) return

        setSoumissionPaiement(true)
        try {
            await enregistrerPaiement(boutiqueId, id, {
                montant,
                modePaiement: paiementMode.value,
                notes: paiementNotes.trim() || undefined,
            })
            setDialogPaiement(false)
            setPaiementMontant('')
            setPaiementNotes('')
            setPaiementMode(optionsModesPaiement[0])
            await chargerVente()
        } catch {
            setErreur('Erreur lors de l\'enregistrement du paiement')
        } finally {
            setSoumissionPaiement(false)
        }
    }

    const handleAnnuler = async () => {
        setAnnulation(true)
        try {
            await annulerVente(boutiqueId, id)
            setDialogAnnulation(false)
            await chargerVente()
        } catch {
            setErreur('Erreur lors de l\'annulation de la vente')
        } finally {
            setAnnulation(false)
        }
    }

    if (chargement) {
        return <Loading loading={true} />
    }

    if (erreur && !vente) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {erreur}
            </div>
        )
    }

    if (!vente) return null

    const montantTotal = vente.montantTotal || vente.montant || 0
    const montantPaye = vente.montantPaye || 0
    const resteAPayer = montantTotal - montantPaye
    const estAnnulee = vente.statut === STATUTS_VENTE.ANNULEE
    const estCompletee = vente.statut === STATUTS_VENTE.COMPLETEE

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate(`/boutiques/${boutiqueId}/ventes`)}
                    />
                    <h2 className="text-2xl font-bold">Détail de la vente</h2>
                </div>
                {!estAnnulee && (
                    <div className="flex gap-2">
                        {!estCompletee && (
                            <Button
                                variant="solid"
                                size="sm"
                                icon={<HiOutlineCash />}
                                onClick={() => setDialogPaiement(true)}
                            >
                                Enregistrer un paiement
                            </Button>
                        )}
                        <Button
                            variant="plain"
                            size="sm"
                            color="red"
                            icon={<HiOutlineBan />}
                            onClick={() => setDialogAnnulation(true)}
                        >
                            Annuler la vente
                        </Button>
                    </div>
                )}
            </div>

            {erreur && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            {/* Informations générales */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Date</p>
                        <p className="font-medium">
                            {formaterDateTime(vente.date || vente.createdAt)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Client</p>
                        <p className="font-medium">{vente.client?.nom || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Type</p>
                        <Tag className="capitalize">
                            {typeLabels[vente.typeVente] || vente.typeVente}
                        </Tag>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Statut</p>
                        <Tag
                            prefix
                            prefixClass={`bg-${statutColors[vente.statut] || 'gray'}-500`}
                        >
                            {statutLabels[vente.statut] || vente.statut}
                        </Tag>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Montant total</p>
                        <p className="font-bold text-lg">{formaterMontant(montantTotal)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Montant payé</p>
                        <p className="font-bold text-lg text-green-600">
                            {formaterMontant(montantPaye)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Reste à payer</p>
                        <p className={`font-bold text-lg ${resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formaterMontant(resteAPayer)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Lignes de produits */}
            <Card className="mb-6">
                <h4 className="font-bold text-lg mb-4">Produits</h4>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                <th className="text-left py-3 px-4 font-semibold text-sm">Produit</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">Quantité</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">Prix unitaire</th>
                                <th className="text-right py-3 px-4 font-semibold text-sm">Sous-total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(vente.lignes || []).map((ligne, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-100 dark:border-gray-700"
                                >
                                    <td className="py-3 px-4 font-medium">
                                        {ligne.produit?.nom || ligne.nomProduit || '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right">{ligne.quantite}</td>
                                    <td className="py-3 px-4 text-right">
                                        {formaterMontant(ligne.prixUnitaire)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium">
                                        {formaterMontant(ligne.prixUnitaire * ligne.quantite)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-300 dark:border-gray-500">
                                <td colSpan={3} className="py-3 px-4 text-right font-bold">
                                    Total
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-lg">
                                    {formaterMontant(montantTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* Échéances (si vente à échéance) */}
            {vente.typeVente === TYPES_VENTE.ECHEANCE && vente.echeances && vente.echeances.length > 0 && (
                <Card className="mb-6">
                    <h4 className="font-bold text-lg mb-4">Échéances</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold text-sm">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Montant</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vente.echeances.map((echeance, index) => (
                                    <tr
                                        key={echeance.id || index}
                                        className="border-b border-gray-100 dark:border-gray-700"
                                    >
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            {formaterDate(echeance.date || echeance.dateEcheance)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formaterMontant(echeance.montant)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Tag
                                                prefix
                                                prefixClass={`bg-${echeanceStatutColors[echeance.statut] || 'gray'}-500`}
                                            >
                                                {echeanceStatutLabels[echeance.statut] || echeance.statut}
                                            </Tag>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Paiements */}
            <Card>
                <h4 className="font-bold text-lg mb-4">Paiements</h4>
                {(!vente.paiements || vente.paiements.length === 0) ? (
                    <div className="text-center py-6 text-gray-500">
                        Aucun paiement enregistré
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Montant</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Mode</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vente.paiements.map((paiement, index) => (
                                    <tr
                                        key={paiement.id || index}
                                        className="border-b border-gray-100 dark:border-gray-700"
                                    >
                                        <td className="py-3 px-4">
                                            {formaterDateTime(paiement.date || paiement.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formaterMontant(paiement.montant)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Tag>{modeLabels[paiement.modePaiement] || paiement.modePaiement}</Tag>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {paiement.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Dialog enregistrer paiement */}
            <Dialog
                isOpen={dialogPaiement}
                onClose={() => setDialogPaiement(false)}
                onRequestClose={() => setDialogPaiement(false)}
            >
                <h5 className="mb-4">Enregistrer un paiement</h5>
                <p className="text-sm text-gray-500 mb-4">
                    Reste à payer : <strong>{formaterMontant(resteAPayer)}</strong>
                </p>
                <Form onSubmit={handleEnregistrerPaiement}>
                    <FormItem label="Montant *">
                        <Input
                            type="number"
                            min={0}
                            max={resteAPayer}
                            value={paiementMontant}
                            onChange={(e) => setPaiementMontant(e.target.value)}
                            placeholder="Montant du paiement"
                        />
                    </FormItem>

                    <FormItem label="Mode de paiement">
                        <Select
                            options={optionsModesPaiement}
                            value={paiementMode}
                            onChange={setPaiementMode}
                        />
                    </FormItem>

                    <FormItem label="Notes">
                        <Input
                            textArea
                            value={paiementNotes}
                            onChange={(e) => setPaiementNotes(e.target.value)}
                            placeholder="Notes (optionnel)"
                        />
                    </FormItem>

                    <div className="text-right mt-4">
                        <Button
                            className="mr-2"
                            variant="plain"
                            onClick={() => setDialogPaiement(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            loading={soumissionPaiement}
                        >
                            Enregistrer
                        </Button>
                    </div>
                </Form>
            </Dialog>

            {/* Dialog annulation */}
            <Dialog
                isOpen={dialogAnnulation}
                onClose={() => setDialogAnnulation(false)}
                onRequestClose={() => setDialogAnnulation(false)}
            >
                <h5 className="mb-4">Confirmer l'annulation</h5>
                <p className="mb-6">
                    Êtes-vous sûr de vouloir annuler cette vente ? Cette action est irréversible.
                </p>
                <div className="text-right">
                    <Button
                        className="mr-2"
                        variant="plain"
                        onClick={() => setDialogAnnulation(false)}
                    >
                        Non, garder
                    </Button>
                    <Button
                        variant="solid"
                        color="red"
                        loading={annulation}
                        onClick={handleAnnuler}
                    >
                        Oui, annuler la vente
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default DetailVente
