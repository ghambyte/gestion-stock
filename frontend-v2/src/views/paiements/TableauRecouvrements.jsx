import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import { recouvrements, clientsEnRetard } from '@/services/kalis/paiementApi'
import { formaterMontant } from '@/utils/formatage'
import {
    HiOutlineCash,
    HiOutlineExclamationCircle,
    HiOutlineClock,
    HiOutlineCalendar,
} from 'react-icons/hi'

const TableauRecouvrements = () => {
    const { boutiqueId } = useParams()

    const [resume, setResume] = useState(null)
    const [clients, setClients] = useState([])
    const [chargement, setChargement] = useState(true)
    const [erreur, setErreur] = useState('')

    useEffect(() => {
        chargerDonnees()
    }, [boutiqueId])

    const chargerDonnees = async () => {
        try {
            const [respRecouvrements, respClients] = await Promise.all([
                recouvrements(boutiqueId),
                clientsEnRetard(boutiqueId),
            ])
            const donneesRecouvrements = respRecouvrements.data.donnees
            setResume(donneesRecouvrements.resume || donneesRecouvrements)
            setClients(respClients.data.donnees || [])
        } catch {
            setErreur('Impossible de charger les données de recouvrement')
        } finally {
            setChargement(false)
        }
    }

    if (chargement) {
        return <Loading loading={true} />
    }

    if (erreur) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {erreur}
            </div>
        )
    }

    const cartes = [
        {
            titre: 'Total en cours',
            valeur: formaterMontant(resume?.totalEnCours),
            icone: <HiOutlineCash className="text-2xl" />,
            couleur: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            couleurIcone: 'text-blue-500',
        },
        {
            titre: 'Total en retard',
            valeur: formaterMontant(resume?.totalEnRetard),
            icone: <HiOutlineExclamationCircle className="text-2xl" />,
            couleur: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            couleurIcone: 'text-red-500',
        },
        {
            titre: 'Échéances en retard',
            valeur: resume?.echeancesEnRetard ?? 0,
            icone: <HiOutlineClock className="text-2xl" />,
            couleur: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            couleurIcone: 'text-amber-500',
        },
        {
            titre: 'Échéances à venir',
            valeur: resume?.echeancesAVenir ?? 0,
            icone: <HiOutlineCalendar className="text-2xl" />,
            couleur: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            couleurIcone: 'text-green-500',
        },
    ]

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Recouvrements</h2>
            </div>

            {/* Cartes statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cartes.map((carte) => (
                    <Card key={carte.titre}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${carte.couleur}`}>
                                {carte.icone}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{carte.titre}</p>
                                <p className="text-xl font-bold">{carte.valeur}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tableau clients en retard */}
            <Card>
                <h4 className="font-bold text-lg mb-4">Clients en retard</h4>
                {clients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun client en retard de paiement
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">
                                        Échéances en retard
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">
                                        Montant total en retard
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, index) => (
                                    <tr
                                        key={client.clientId || client.id || index}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="py-3 px-4 font-medium">
                                            {client.nom || client.client?.nom || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="inline-flex items-center justify-center bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full px-3 py-1 text-sm font-medium">
                                                {client.nombreEcheancesRetard ?? client.echeancesEnRetard ?? 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-red-600">
                                            {formaterMontant(client.montantTotalRetard ?? client.montantEnRetard)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default TableauRecouvrements
