import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FormItem, Form } from '@/components/ui/Form'
import Loading from '@/components/shared/Loading'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    creerProduit,
    modifierProduit,
    detailProduit,
} from '@/services/kalis/produitApi'
import { listerCategories } from '@/services/kalis/categorieApi'

const FormulaireProduit = () => {
    const { boutiqueId, id } = useParams()
    const navigate = useNavigate()
    const estEdition = Boolean(id)

    const [chargement, setChargement] = useState(false)
    const [soumission, setSoumission] = useState(false)
    const [categories, setCategories] = useState([])
    const [formulaire, setFormulaire] = useState({
        nom: '',
        description: '',
        categorieId: '',
        prixAchat: '',
        prixVente: '',
        quantiteStock: '',
        seuilAlerte: '',
    })
    const [erreurs, setErreurs] = useState({})

    const chargerCategories = useCallback(async () => {
        try {
            const resp = await listerCategories(boutiqueId)
            const cats = resp.data.donnees || []
            setCategories(
                cats.map((c) => ({ value: c._id || c.id, label: c.nom })),
            )
        } catch (err) {
            console.error('Erreur chargement categories:', err)
        }
    }, [boutiqueId])

    const chargerProduit = useCallback(async () => {
        if (!id) return
        try {
            setChargement(true)
            const resp = await detailProduit(boutiqueId, id)
            const produit = resp.data.donnees
            setFormulaire({
                nom: produit.nom || '',
                description: produit.description || '',
                categorieId:
                    produit.categorieId ||
                    produit.categorie?._id ||
                    produit.categorie?.id ||
                    '',
                prixAchat: produit.prixAchat ?? '',
                prixVente: produit.prixVente ?? '',
                quantiteStock: produit.quantiteStock ?? '',
                seuilAlerte: produit.seuilAlerte ?? '',
            })
        } catch (err) {
            console.error('Erreur chargement produit:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    Impossible de charger le produit.
                </Notification>,
            )
        } finally {
            setChargement(false)
        }
    }, [boutiqueId, id])

    useEffect(() => {
        if (boutiqueId) {
            chargerCategories()
            chargerProduit()
        }
    }, [boutiqueId, chargerCategories, chargerProduit])

    const handleChange = (champ, valeur) => {
        setFormulaire((prev) => ({ ...prev, [champ]: valeur }))
        if (erreurs[champ]) {
            setErreurs((prev) => ({ ...prev, [champ]: '' }))
        }
    }

    const valider = () => {
        const nouvellesErreurs = {}
        if (!formulaire.nom.trim()) {
            nouvellesErreurs.nom = 'Le nom est requis'
        }
        if (!formulaire.prixAchat && formulaire.prixAchat !== 0) {
            nouvellesErreurs.prixAchat = 'Le prix d\'achat est requis'
        }
        if (!formulaire.prixVente && formulaire.prixVente !== 0) {
            nouvellesErreurs.prixVente = 'Le prix de vente est requis'
        }
        if (!estEdition && !formulaire.quantiteStock && formulaire.quantiteStock !== 0) {
            nouvellesErreurs.quantiteStock = 'La quantite en stock est requise'
        }
        setErreurs(nouvellesErreurs)
        return Object.keys(nouvellesErreurs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!valider()) return

        try {
            setSoumission(true)
            const donnees = {
                nom: formulaire.nom,
                description: formulaire.description,
                categorieId: formulaire.categorieId || undefined,
                prixAchat: parseFloat(formulaire.prixAchat),
                prixVente: parseFloat(formulaire.prixVente),
                seuilAlerte: formulaire.seuilAlerte
                    ? parseInt(formulaire.seuilAlerte, 10)
                    : undefined,
            }

            if (!estEdition) {
                donnees.quantiteStock = parseInt(formulaire.quantiteStock, 10)
            }

            if (estEdition) {
                await modifierProduit(boutiqueId, id, donnees)
                toast.push(
                    <Notification type="success" title="Succes">
                        Produit modifie avec succes.
                    </Notification>,
                )
            } else {
                await creerProduit(boutiqueId, donnees)
                toast.push(
                    <Notification type="success" title="Succes">
                        Produit cree avec succes.
                    </Notification>,
                )
            }
            navigate(`/boutiques/${boutiqueId}/produits`)
        } catch (err) {
            console.error('Erreur sauvegarde produit:', err)
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err.response?.data?.message ||
                        'Erreur lors de la sauvegarde du produit.'}
                </Notification>,
            )
        } finally {
            setSoumission(false)
        }
    }

    if (chargement) {
        return <Loading loading={true} className="w-full h-96" />
    }

    const categorieSelectionnee = categories.find(
        (c) => c.value === formulaire.categorieId,
    )

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">
                {estEdition ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>

            <Card>
                <Form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <FormItem
                            label="Nom"
                            asterisk
                            invalid={Boolean(erreurs.nom)}
                            errorMessage={erreurs.nom}
                        >
                            <Input
                                placeholder="Nom du produit"
                                value={formulaire.nom}
                                onChange={(e) =>
                                    handleChange('nom', e.target.value)
                                }
                            />
                        </FormItem>

                        <FormItem label="Categorie">
                            <Select
                                placeholder="Selectionner une categorie"
                                options={categories}
                                value={categorieSelectionnee || null}
                                onChange={(option) =>
                                    handleChange(
                                        'categorieId',
                                        option ? option.value : '',
                                    )
                                }
                                isClearable
                            />
                        </FormItem>

                        <FormItem
                            label="Prix d'achat"
                            asterisk
                            invalid={Boolean(erreurs.prixAchat)}
                            errorMessage={erreurs.prixAchat}
                        >
                            <Input
                                type="number"
                                placeholder="0"
                                value={formulaire.prixAchat}
                                onChange={(e) =>
                                    handleChange('prixAchat', e.target.value)
                                }
                            />
                        </FormItem>

                        <FormItem
                            label="Prix de vente"
                            asterisk
                            invalid={Boolean(erreurs.prixVente)}
                            errorMessage={erreurs.prixVente}
                        >
                            <Input
                                type="number"
                                placeholder="0"
                                value={formulaire.prixVente}
                                onChange={(e) =>
                                    handleChange('prixVente', e.target.value)
                                }
                            />
                        </FormItem>

                        {!estEdition && (
                            <FormItem
                                label="Quantite en stock"
                                asterisk
                                invalid={Boolean(erreurs.quantiteStock)}
                                errorMessage={erreurs.quantiteStock}
                            >
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formulaire.quantiteStock}
                                    onChange={(e) =>
                                        handleChange(
                                            'quantiteStock',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormItem>
                        )}

                        <FormItem label="Seuil d'alerte">
                            <Input
                                type="number"
                                placeholder="0"
                                value={formulaire.seuilAlerte}
                                onChange={(e) =>
                                    handleChange('seuilAlerte', e.target.value)
                                }
                            />
                        </FormItem>

                        <div className="md:col-span-2">
                            <FormItem label="Description">
                                <Input
                                    textArea
                                    rows={4}
                                    placeholder="Description du produit"
                                    value={formulaire.description}
                                    onChange={(e) =>
                                        handleChange(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/boutiques/${boutiqueId}/produits`,
                                )
                            }
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            loading={soumission}
                        >
                            {estEdition ? 'Modifier' : 'Creer'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default FormulaireProduit
