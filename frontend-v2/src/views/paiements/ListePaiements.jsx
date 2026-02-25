import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Loading from '@/components/shared/Loading'
import { listerPaiements } from '@/services/kalis/paiementApi'
import { formaterMontant, formaterDateTime } from '@/utils/formatage'
import { MODES_PAIEMENT } from '@/utils/constantes'

const LIMITE = 20

const modeLabels = {
    [MODES_PAIEMENT.ESPECES]: 'Espèces',
    [MODES_PAIEMENT.MOBILE_MONEY]: 'Mobile Money',
    [MODES_PAIEMENT.VIREMENT]: 'Virement',
    [MODES_PAIEMENT.AUTRE]: 'Autre',
}

const ListePaiements = () => {
    const { boutiqueId } = useParams()

    const [paiements, setPaiements] = useState([])
    const [chargement, setChargement] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [erreur, setErreur] = useState('')

    const chargerPaiements = useCallback(async () => {
        setChargement(true)
        setErreur('')
        try {
            const params = { page, limite: LIMITE }
            if (dateDebut) params.dateDebut = dateDebut
            if (dateFin) params.dateFin = dateFin
            const resp = await listerPaiements(boutiqueId, params)
            setPaiements(resp.data.donnees || [])
            setTotal(resp.data.pagination?.total || 0)
        } catch {
            setErreur('Impossible de charger les paiements')
        } finally {
            setChargement(false)
        }
    }, [boutiqueId, page, dateDebut, dateFin])

    useEffect(() => {
        chargerPaiements()
    }, [chargerPaiements])

    const handleDateDebut = (e) => {
        setDateDebut(e.target.value)
        setPage(1)
    }

    const handleDateFin = (e) => {
        setDateFin(e.target.value)
        setPage(1)
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Paiements</h2>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="w-full sm:w-48">
                        <label className="text-sm text-gray-500 mb-1 block">Date début</label>
                        <Input
                            type="date"
                            value={dateDebut}
                            onChange={handleDateDebut}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="text-sm text-gray-500 mb-1 block">Date fin</label>
                        <Input
                            type="date"
                            value={dateFin}
                            onChange={handleDateFin}
                        />
                    </div>
                </div>

                {erreur && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {erreur}
                    </div>
                )}

                {chargement ? (
                    <Loading loading={true} />
                ) : paiements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun paiement trouvé
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Vente #</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm">Montant</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Mode</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paiements.map((paiement) => (
                                        <tr
                                            key={paiement.id}
                                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="py-3 px-4">
                                                {formaterDateTime(paiement.date || paiement.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {paiement.venteId || paiement.vente?.id || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {paiement.vente?.client?.nom || paiement.clientNom || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {formaterMontant(paiement.montant)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Tag>
                                                    {modeLabels[paiement.modePaiement] || paiement.modePaiement}
                                                </Tag>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {paiement.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {total > LIMITE && (
                            <div className="flex justify-end mt-4">
                                <Pagination
                                    currentPage={page}
                                    total={total}
                                    pageSize={LIMITE}
                                    onChange={(p) => setPage(p)}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    )
}

export default ListePaiements
