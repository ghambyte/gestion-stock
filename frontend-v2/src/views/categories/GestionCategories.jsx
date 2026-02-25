import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    listerCategories,
    creerCategorie,
    modifierCategorie,
    supprimerCategorie,
} from '@/services/kalis/categorieApi'

const GestionCategories = () => {
    const { boutiqueId } = useParams()

    const [chargement, setChargement] = useState(true)
    const [categories, setCategories] = useState([])

    // Formulaire ajout
    const [nouveauNom, setNouveauNom] = useState('')
    const [nouvelleDescription, setNouvelleDescription] = useState('')
    const [soumissionAjout, setSoumissionAjout] = useState(false)

    // Edition inline
    const [editionId, setEditionId] = useState(null)
    const [editionNom, setEditionNom] = useState('')
    const [editionDescription, setEditionDescription] = useState('')
    const [soumissionEdition, setSoumissionEdition] = useState(false)

    // Dialog suppression
    const [dialogSuppression, setDialogSuppression] = useState(false)
    const [categorieASupprimer, setCategorieASupprimer] = useState(null)
    const [soumissionSuppression, setSoumissionSuppression] = useState(false)

    const chargerCategories = useCallback(async () => {
        try {
            setChargement(true)
            const resp = await listerCategories(boutiqueId)
            setCategories(resp.data.donnees || [])
        } catch (err) {
            console.error('Erreur chargement categories:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    Impossible de charger les categories.
                </Notification>,
            )
        } finally {
            setChargement(false)
        }
    }, [boutiqueId])

    useEffect(() => {
        if (boutiqueId) {
            chargerCategories()
        }
    }, [boutiqueId, chargerCategories])

    const handleAjouter = async () => {
        if (!nouveauNom.trim()) return

        try {
            setSoumissionAjout(true)
            await creerCategorie(boutiqueId, {
                nom: nouveauNom.trim(),
                description: nouvelleDescription.trim() || undefined,
            })
            toast.push(
                <Notification type="success" title="Succes">
                    Categorie ajoutee avec succes.
                </Notification>,
            )
            setNouveauNom('')
            setNouvelleDescription('')
            chargerCategories()
        } catch (err) {
            console.error('Erreur creation categorie:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err.response?.data?.message ||
                        'Erreur lors de la creation de la categorie.'}
                </Notification>,
            )
        } finally {
            setSoumissionAjout(false)
        }
    }

    const commencerEdition = (categorie) => {
        setEditionId(categorie._id || categorie.id)
        setEditionNom(categorie.nom)
        setEditionDescription(categorie.description || '')
    }

    const annulerEdition = () => {
        setEditionId(null)
        setEditionNom('')
        setEditionDescription('')
    }

    const handleModifier = async () => {
        if (!editionNom.trim() || !editionId) return

        try {
            setSoumissionEdition(true)
            await modifierCategorie(boutiqueId, editionId, {
                nom: editionNom.trim(),
                description: editionDescription.trim() || undefined,
            })
            toast.push(
                <Notification type="success" title="Succes">
                    Categorie modifiee avec succes.
                </Notification>,
            )
            annulerEdition()
            chargerCategories()
        } catch (err) {
            console.error('Erreur modification categorie:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err.response?.data?.message ||
                        'Erreur lors de la modification de la categorie.'}
                </Notification>,
            )
        } finally {
            setSoumissionEdition(false)
        }
    }

    const ouvrirDialogSuppression = (categorie) => {
        setCategorieASupprimer(categorie)
        setDialogSuppression(true)
    }

    const handleSupprimer = async () => {
        if (!categorieASupprimer) return

        try {
            setSoumissionSuppression(true)
            await supprimerCategorie(
                boutiqueId,
                categorieASupprimer._id || categorieASupprimer.id,
            )
            toast.push(
                <Notification type="success" title="Succes">
                    Categorie supprimee avec succes.
                </Notification>,
            )
            setDialogSuppression(false)
            setCategorieASupprimer(null)
            chargerCategories()
        } catch (err) {
            console.error('Erreur suppression categorie:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err.response?.data?.message ||
                        'Erreur lors de la suppression de la categorie.'}
                </Notification>,
            )
        } finally {
            setSoumissionSuppression(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">
                Gestion des categories
            </h2>

            {/* Formulaire d'ajout */}
            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="form-label mb-2">Nom</label>
                        <Input
                            placeholder="Nom de la categorie"
                            value={nouveauNom}
                            onChange={(e) => setNouveauNom(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="form-label mb-2">Description</label>
                        <Input
                            placeholder="Description (optionnel)"
                            value={nouvelleDescription}
                            onChange={(e) =>
                                setNouvelleDescription(e.target.value)
                            }
                        />
                    </div>
                    <Button
                        variant="solid"
                        loading={soumissionAjout}
                        onClick={handleAjouter}
                        disabled={!nouveauNom.trim()}
                    >
                        Ajouter
                    </Button>
                </div>
            </Card>

            {/* Tableau des categories */}
            <Card>
                <Loading loading={chargement}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-3 px-4 font-semibold">
                                        Nom
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold">
                                        Description
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? (
                                    categories.map((categorie) => {
                                        const catId =
                                            categorie._id || categorie.id
                                        const estEnEdition =
                                            editionId === catId

                                        return (
                                            <tr
                                                key={catId}
                                                className="border-b border-gray-100 dark:border-gray-700"
                                            >
                                                <td className="py-3 px-4">
                                                    {estEnEdition ? (
                                                        <Input
                                                            value={editionNom}
                                                            onChange={(e) =>
                                                                setEditionNom(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="font-medium">
                                                            {categorie.nom}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {estEnEdition ? (
                                                        <Input
                                                            value={
                                                                editionDescription
                                                            }
                                                            onChange={(e) =>
                                                                setEditionDescription(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            {categorie.description ||
                                                                '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {estEnEdition ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={
                                                                    annulerEdition
                                                                }
                                                            >
                                                                Annuler
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="solid"
                                                                loading={
                                                                    soumissionEdition
                                                                }
                                                                onClick={
                                                                    handleModifier
                                                                }
                                                                disabled={
                                                                    !editionNom.trim()
                                                                }
                                                            >
                                                                Enregistrer
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    commencerEdition(
                                                                        categorie,
                                                                    )
                                                                }
                                                            >
                                                                Modifier
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-600"
                                                                onClick={() =>
                                                                    ouvrirDialogSuppression(
                                                                        categorie,
                                                                    )
                                                                }
                                                            >
                                                                Supprimer
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Aucune categorie
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Loading>
            </Card>

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
                    Etes-vous sur de vouloir supprimer la categorie{' '}
                    <span className="font-semibold">
                        {categorieASupprimer?.nom}
                    </span>{' '}
                    ? Cette action est irreversible.
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

export default GestionCategories
