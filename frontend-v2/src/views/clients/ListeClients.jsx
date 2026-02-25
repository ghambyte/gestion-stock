import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Loading from '@/components/shared/Loading'
import { listerClients } from '@/services/kalis/clientApi'
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi'

const LIMITE = 20

const ListeClients = () => {
    const { boutiqueId } = useParams()
    const navigate = useNavigate()

    const [clients, setClients] = useState([])
    const [chargement, setChargement] = useState(true)
    const [recherche, setRecherche] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [erreur, setErreur] = useState('')

    const chargerClients = useCallback(async () => {
        setChargement(true)
        setErreur('')
        try {
            const params = { page, limite: LIMITE }
            if (recherche.trim()) {
                params.recherche = recherche.trim()
            }
            const resp = await listerClients(boutiqueId, params)
            setClients(resp.data.donnees || [])
            setTotal(resp.data.pagination?.total || 0)
        } catch {
            setErreur('Impossible de charger la liste des clients')
        } finally {
            setChargement(false)
        }
    }, [boutiqueId, page, recherche])

    useEffect(() => {
        chargerClients()
    }, [chargerClients])

    const handleRecherche = (e) => {
        setRecherche(e.target.value)
        setPage(1)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Clients</h2>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => navigate(`/boutiques/${boutiqueId}/clients/nouveau`)}
                >
                    Nouveau Client
                </Button>
            </div>

            <Card>
                <div className="mb-4">
                    <Input
                        prefix={<HiOutlineSearch className="text-lg" />}
                        placeholder="Rechercher par nom ou téléphone..."
                        value={recherche}
                        onChange={handleRecherche}
                    />
                </div>

                {erreur && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {erreur}
                    </div>
                )}

                {chargement ? (
                    <Loading loading={true} />
                ) : clients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Aucun client trouvé
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-600">
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Nom</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Téléphone</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr
                                            key={client.id}
                                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="py-3 px-4 font-medium">{client.nom}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                {client.telephone || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                {client.email || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    icon={<HiOutlineEye />}
                                                    onClick={() => navigate(`/boutiques/${boutiqueId}/clients/${client.id}`)}
                                                >
                                                    Voir
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    icon={<HiOutlinePencil />}
                                                    onClick={() => navigate(`/boutiques/${boutiqueId}/clients/${client.id}/modifier`)}
                                                >
                                                    Modifier
                                                </Button>
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

export default ListeClients
