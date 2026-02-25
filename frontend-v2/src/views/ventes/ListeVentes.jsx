import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Select from '@/components/ui/Select'
import Pagination from '@/components/ui/Pagination'
import Loading from '@/components/shared/Loading'
import { listerVentes } from '@/services/kalis/venteApi'
import { formaterMontant, formaterDate } from '@/utils/formatage'
import { STATUTS_VENTE, TYPES_VENTE } from '@/utils/constantes'
import { HiOutlinePlus } from 'react-icons/hi'

const LIMITE = 20

const optionsType = [
    { value: '', label: 'Tous les types' },
    { value: TYPES_VENTE.COMPTANT, label: 'Comptant' },
    { value: TYPES_VENTE.ECHEANCE, label: 'Échéance' },
]

const optionsStatut = [
    { value: '', label: 'Tous les statuts' },
    { value: STATUTS_VENTE.COMPLETEE, label: 'Complétée' },
    { value: STATUTS_VENTE.EN_COURS, label: 'En cours' },
    { value: STATUTS_VENTE.ANNULEE, label: 'Annulée' },
]

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

const ListeVentes = () => {
    const { boutiqueId } = useParams()
    const navigate = useNavigate()

    const [ventes, setVentes] = useState([])
    const [chargement, setChargement] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [filtreType, setFiltreType] = useState(optionsType[0])
    const [filtreStatut, setFiltreStatut] = useState(optionsStatut[0])
    const [erreur, setErreur] = useState('')

    const chargerVentes = useCallback(async () => {
        setChargement(true)
        setErreur('')
        try {
            const params = { page, limite: LIMITE }
            if (filtreType.value) params.typeVente = filtreType.value
            if (filtreStatut.value) params.statut = filtreStatut.value
            const resp = await listerVentes(boutiqueId, params)
            setVentes(resp.data.donnees || [])
            setTotal(resp.data.pagination?.total || 0)
        } catch {
            setErreur('Impossible de charger les ventes')
        } finally {
            setChargement(false)
        }
    }, [boutiqueId, page, filtreType, filtreStatut])

    useEffect(() => {
        chargerVentes()
    }, [chargerVentes])

    const handleChangeType = (option) => {
        setFiltreType(option)
        setPage(1)
    }

    const handleChangeStatut = (option) => {
        setFiltreStatut(option)
        setPage(1)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Ventes</h2>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => navigate(`/boutiques/${boutiqueId}/ventes/nouvelle`)}
                >
                    Nouvelle Vente
                </Button>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="w-full sm:w-48">
                        <Select
                            placeholder="Type"
                            options={optionsType}
                            value={filtreType}
                            onChange={handleChangeType}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            placeholder="Statut"
                            options={optionsStatut}
                            value={filtreStatut}
                            onChange={handleChangeStatut}
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
                ) : ventes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucune vente trouvée
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm">Montant</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm">Payé</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm">Reste</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventes.map((vente) => {
                                        const montant = vente.montantTotal || vente.montant || 0
                                        const paye = vente.montantPaye || 0
                                        const reste = montant - paye

                                        return (
                                            <tr
                                                key={vente.id}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                                onClick={() => navigate(`/boutiques/${boutiqueId}/ventes/${vente.id}`)}
                                            >
                                                <td className="py-3 px-4">
                                                    {formaterDate(vente.date || vente.createdAt)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {vente.client?.nom || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Tag className="capitalize">
                                                        {typeLabels[vente.typeVente] || vente.typeVente}
                                                    </Tag>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    {formaterMontant(montant)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {formaterMontant(paye)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {formaterMontant(reste)}
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
                                        )
                                    })}
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

export default ListeVentes
