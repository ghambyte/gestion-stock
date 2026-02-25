import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Loading from '@/components/shared/Loading'
import { useBoutiqueStore } from '@/store/boutiqueStore'
import { useSessionUser } from '@/store/authStore'
import { listerBoutiques, creerBoutique } from '@/services/kalis/boutiqueApi'
import { useAuth } from '@/auth'
import {
    HiOutlinePlus,
    HiOutlineLogout,
    HiOutlineArrowRight,
    HiOutlineLocationMarker,
} from 'react-icons/hi'
import { PiStorefrontDuotone } from 'react-icons/pi'

const ListeBoutiques = () => {
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const user = useSessionUser((state) => state.user)
    const selectionnerBoutique = useBoutiqueStore(
        (state) => state.selectionnerBoutique,
    )

    const [boutiques, setBoutiques] = useState([])
    const [chargement, setChargement] = useState(true)
    const [dialogOuvert, setDialogOuvert] = useState(false)
    const [nomNouvelle, setNomNouvelle] = useState('')
    const [adresseNouvelle, setAdresseNouvelle] = useState('')
    const [creation, setCreation] = useState(false)
    const [erreur, setErreur] = useState('')

    const chargerBoutiques = async () => {
        try {
            const resp = await listerBoutiques()
            setBoutiques(resp.data.donnees || [])
        } catch {
            setErreur('Impossible de charger les boutiques')
        } finally {
            setChargement(false)
        }
    }

    useEffect(() => {
        chargerBoutiques()
    }, [])

    const handleSelectionner = (boutique) => {
        selectionnerBoutique(boutique)
        navigate(`/boutiques/${boutique.id}/tableau-de-bord`)
    }

    const handleCreer = async (e) => {
        e.preventDefault()
        if (!nomNouvelle.trim()) return
        setCreation(true)
        try {
            const resp = await creerBoutique({
                nom: nomNouvelle.trim(),
                adresse: adresseNouvelle.trim(),
            })
            const nouvelleBoutique = resp.data.donnees
            setBoutiques((prev) => [...prev, nouvelleBoutique])
            setDialogOuvert(false)
            setNomNouvelle('')
            setAdresseNouvelle('')
            handleSelectionner(nouvelleBoutique)
        } catch {
            setErreur('Erreur lors de la création')
        } finally {
            setCreation(false)
        }
    }

    const prenom = user?.userName?.split(' ')[0] || ''

    if (chargement) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading loading={true} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">K</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 dark:text-white">KALIS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {user?.userName || 'Utilisateur'}
                            </p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                {(user?.userName || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <Button
                            size="xs"
                            variant="plain"
                            icon={<HiOutlineLogout />}
                            onClick={() => signOut()}
                        >
                            <span className="hidden sm:inline">Deconnexion</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* Welcome */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {prenom ? `Bonjour, ${prenom}` : 'Mes Boutiques'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {boutiques.length > 0
                            ? 'Selectionnez une boutique pour acceder a son tableau de bord.'
                            : 'Commencez par creer votre premiere boutique.'}
                    </p>
                </div>

                {erreur && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
                        {erreur}
                    </div>
                )}

                {/* Boutiques Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {boutiques.map((boutique) => (
                        <Card
                            key={boutique.id}
                            clickable
                            className="group hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer"
                            onClick={() => handleSelectionner(boutique)}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                                        <PiStorefrontDuotone className="text-white text-2xl" />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <HiOutlineArrowRight className="text-blue-500 text-xl" />
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-bold text-gray-800 dark:text-white text-lg mb-1">
                                        {boutique.nom}
                                    </h5>
                                    {boutique.adresse ? (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                            <HiOutlineLocationMarker className="text-base flex-shrink-0" />
                                            <span>{boutique.adresse}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-300 dark:text-gray-600 italic">
                                            Aucune adresse
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Add Boutique Card */}
                    <div
                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-3 py-10 px-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 group"
                        onClick={() => setDialogOuvert(true)}
                    >
                        <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <HiOutlinePlus className="text-2xl text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                            Nouvelle Boutique
                        </span>
                    </div>
                </div>

                {/* Footer info */}
                {boutiques.length > 0 && (
                    <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-12">
                        {boutiques.length} boutique{boutiques.length > 1 ? 's' : ''} &middot; KALIS Gestion de Stock
                    </p>
                )}
            </div>

            {/* Dialog */}
            <Dialog
                isOpen={dialogOuvert}
                onClose={() => setDialogOuvert(false)}
                onRequestClose={() => setDialogOuvert(false)}
            >
                <h5 className="mb-4">Creer une boutique</h5>
                <Form onSubmit={handleCreer}>
                    <FormItem label="Nom de la boutique">
                        <Input
                            value={nomNouvelle}
                            onChange={(e) => setNomNouvelle(e.target.value)}
                            placeholder="Ex: Ma Quincaillerie"
                        />
                    </FormItem>
                    <FormItem label="Adresse (optionnel)">
                        <Input
                            value={adresseNouvelle}
                            onChange={(e) =>
                                setAdresseNouvelle(e.target.value)
                            }
                            placeholder="Adresse de la boutique"
                        />
                    </FormItem>
                    <div className="text-right mt-4">
                        <Button
                            className="mr-2"
                            variant="plain"
                            onClick={() => setDialogOuvert(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            loading={creation}
                        >
                            Creer
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </div>
    )
}

export default ListeBoutiques
