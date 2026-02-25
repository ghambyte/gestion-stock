import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Loading from '@/components/shared/Loading'
import Chart from 'react-apexcharts'
import { formaterMontant, formaterDate } from '@/utils/formatage'
import {
    resume,
    revenus,
    meilleursProducts,
    alertes,
} from '@/services/kalis/tableauDeBordApi'

const StatCard = ({ titre, valeur, couleur = 'text-gray-900' }) => (
    <Card>
        <p className="text-sm text-gray-500 mb-1">{titre}</p>
        <p className={`text-2xl font-bold ${couleur}`}>{valeur}</p>
    </Card>
)

const TableauDeBord = () => {
    const { boutiqueId } = useParams()
    const [chargement, setChargement] = useState(true)
    const [resumeData, setResumeData] = useState(null)
    const [revenusData, setRevenusData] = useState([])
    const [meilleursProduitsData, setMeilleursProduitsData] = useState([])
    const [alertesData, setAlertesData] = useState(null)

    useEffect(() => {
        const chargerDonnees = async () => {
            try {
                setChargement(true)
                const [resResume, resRevenus, resMeilleurs, resAlertes] =
                    await Promise.all([
                        resume(boutiqueId),
                        revenus(boutiqueId),
                        meilleursProducts(boutiqueId),
                        alertes(boutiqueId),
                    ])
                setResumeData(resResume.data.donnees)
                setRevenusData(resRevenus.data.donnees)
                setMeilleursProduitsData(resMeilleurs.data.donnees)
                setAlertesData(resAlertes.data.donnees)
            } catch (err) {
                console.error('Erreur chargement tableau de bord:', err)
            } finally {
                setChargement(false)
            }
        }
        if (boutiqueId) {
            chargerDonnees()
        }
    }, [boutiqueId])

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
        },
        xaxis: {
            categories: revenusData.map((r) => r.periode || r.mois || r.label),
        },
        colors: ['#4F46E5'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '50%',
            },
        },
        dataLabels: { enabled: false },
        tooltip: {
            y: {
                formatter: (val) => formaterMontant(val),
            },
        },
    }

    const chartSeries = [
        {
            name: 'Revenus',
            data: revenusData.map((r) => r.montant || r.total || 0),
        },
    ]

    if (chargement) {
        return <Loading loading={true} className="w-full h-96" />
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Tableau de bord</h2>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard
                    titre="Chiffre d'affaires"
                    valeur={formaterMontant(resumeData?.chiffreAffaires)}
                    couleur="text-indigo-600"
                />
                <StatCard
                    titre="Total ventes"
                    valeur={resumeData?.totalVentes || 0}
                    couleur="text-blue-600"
                />
                <StatCard
                    titre="Montant en attente"
                    valeur={formaterMontant(resumeData?.montantEnAttente)}
                    couleur="text-orange-500"
                />
                <StatCard
                    titre="Valeur du stock"
                    valeur={formaterMontant(resumeData?.valeurStock)}
                    couleur="text-green-600"
                />
                <StatCard
                    titre="Clients actifs"
                    valeur={resumeData?.clientsActifs || 0}
                    couleur="text-purple-600"
                />
                <StatCard
                    titre="Produits en stock bas"
                    valeur={resumeData?.produitsStockBas || 0}
                    couleur="text-red-600"
                />
            </div>

            {/* Graphique des revenus */}
            <Card
                className="mb-8"
                header={{ content: 'Revenus' }}
            >
                {revenusData.length > 0 ? (
                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height={350}
                    />
                ) : (
                    <p className="text-gray-500 text-center py-8">
                        Aucune donnee de revenus disponible
                    </p>
                )}
            </Card>

            {/* Meilleurs produits */}
            <Card
                className="mb-8"
                header={{ content: 'Meilleurs produits' }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                <th className="text-left py-3 px-4 font-semibold">
                                    Produit
                                </th>
                                <th className="text-right py-3 px-4 font-semibold">
                                    Quantite vendue
                                </th>
                                <th className="text-right py-3 px-4 font-semibold">
                                    Montant total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {meilleursProduitsData.length > 0 ? (
                                meilleursProduitsData
                                    .slice(0, 5)
                                    .map((produit, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-gray-100 dark:border-gray-700"
                                        >
                                            <td className="py-3 px-4">
                                                {produit.nom}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {produit.quantiteVendue}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {formaterMontant(
                                                    produit.montantTotal,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-6 text-center text-gray-500"
                                    >
                                        Aucun produit vendu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Alertes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock bas */}
                <Card header={{ content: 'Alertes - Stock bas' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold">
                                        Produit
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Stock
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Seuil
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {alertesData?.stockBas?.length > 0 ? (
                                    alertesData.stockBas.map(
                                        (alerte, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 dark:border-gray-700"
                                            >
                                                <td className="py-3 px-4">
                                                    {alerte.nom}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Tag className="bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-400/20">
                                                        {alerte.quantiteStock}
                                                    </Tag>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {alerte.seuilAlerte}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="py-6 text-center text-gray-500"
                                        >
                                            Aucune alerte de stock bas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Echeances en retard */}
                <Card header={{ content: 'Alertes - Echeances en retard' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold">
                                        Client
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Montant
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {alertesData?.echeancesEnRetard?.length > 0 ? (
                                    alertesData.echeancesEnRetard.map(
                                        (echeance, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-100 dark:border-gray-700"
                                            >
                                                <td className="py-3 px-4">
                                                    {echeance.client ||
                                                        echeance.nomClient}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Tag className="bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-400/20">
                                                        {formaterMontant(
                                                            echeance.montant,
                                                        )}
                                                    </Tag>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {formaterDate(
                                                        echeance.dateEcheance,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="py-6 text-center text-gray-500"
                                        >
                                            Aucune echeance en retard
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default TableauDeBord
