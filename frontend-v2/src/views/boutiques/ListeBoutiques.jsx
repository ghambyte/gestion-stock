import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Loading from '@/components/shared/Loading'
import { useBoutiqueStore } from '@/store/boutiqueStore'
import { listerBoutiques, creerBoutique } from '@/services/kalis/boutiqueApi'
import { useAuth } from '@/auth'
import { HiOutlinePlus, HiOutlineLogout } from 'react-icons/hi'
import { PiStorefrontDuotone } from 'react-icons/pi'

const ListeBoutiques = () => {
    const navigate = useNavigate()
    const { signOut } = useAuth()
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

    if (chargement) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading loading={true} />
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Mes Boutiques</h2>
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineLogout />}
                        onClick={() => signOut()}
                    >
                        Déconnexion
                    </Button>
                </div>

                {erreur && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {erreur}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {boutiques.map((boutique) => (
                        <Card
                            key={boutique.id}
                            clickable
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleSelectionner(boutique)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl text-indigo-500">
                                    <PiStorefrontDuotone />
                                </div>
                                <div>
                                    <h5 className="font-bold">
                                        {boutique.nom}
                                    </h5>
                                    {boutique.adresse && (
                                        <p className="text-sm text-gray-500">
                                            {boutique.adresse}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => setDialogOuvert(true)}
                >
                    Nouvelle Boutique
                </Button>

                <Dialog
                    isOpen={dialogOuvert}
                    onClose={() => setDialogOuvert(false)}
                    onRequestClose={() => setDialogOuvert(false)}
                >
                    <h5 className="mb-4">Créer une boutique</h5>
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
                                Créer
                            </Button>
                        </div>
                    </Form>
                </Dialog>
            </div>
        </div>
    )
}

export default ListeBoutiques
