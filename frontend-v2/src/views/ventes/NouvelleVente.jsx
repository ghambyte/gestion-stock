import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FormItem, Form } from '@/components/ui/Form'
import Loading from '@/components/shared/Loading'
import { creerVente } from '@/services/kalis/venteApi'
import { listerClients } from '@/services/kalis/clientApi'
import { listerProduits } from '@/services/kalis/produitApi'
import { formaterMontant } from '@/utils/formatage'
import { TYPES_VENTE, MODES_PAIEMENT } from '@/utils/constantes'
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

const optionsModesPaiement = [
    { value: MODES_PAIEMENT.ESPECES, label: 'Espèces' },
    { value: MODES_PAIEMENT.MOBILE_MONEY, label: 'Mobile Money' },
    { value: MODES_PAIEMENT.VIREMENT, label: 'Virement' },
]

const ligneVide = () => ({
    produitId: null,
    quantite: 1,
    prixUnitaire: 0,
    produitSelectionne: null,
})

const NouvelleVente = () => {
    const { boutiqueId } = useParams()
    const navigate = useNavigate()

    const [type, setType] = useState(TYPES_VENTE.COMPTANT)
    const [clientSelectionne, setClientSelectionne] = useState(null)
    const [lignes, setLignes] = useState([ligneVide()])
    const [modePaiement, setModePaiement] = useState(optionsModesPaiement[0])
    const [acompte, setAcompte] = useState('')
    const [nombreEcheances, setNombreEcheances] = useState('')
    const [dateDebutEcheances, setDateDebutEcheances] = useState('')

    const [clients, setClients] = useState([])
    const [produits, setProduits] = useState([])
    const [chargement, setChargement] = useState(true)
    const [soumission, setSoumission] = useState(false)
    const [erreur, setErreur] = useState('')

    useEffect(() => {
        chargerDonnees()
    }, [boutiqueId])

    const chargerDonnees = async () => {
        try {
            const [respClients, respProduits] = await Promise.all([
                listerClients(boutiqueId, { limite: 1000 }),
                listerProduits(boutiqueId, { limite: 1000 }),
            ])
            setClients(respClients.data.donnees || [])
            setProduits(respProduits.data.donnees || [])
        } catch {
            setErreur('Erreur lors du chargement des données')
        } finally {
            setChargement(false)
        }
    }

    const optionsClients = useMemo(
        () => clients.map((c) => ({ value: c.id, label: c.nom })),
        [clients],
    )

    const optionsProduits = useMemo(
        () =>
            produits.map((p) => ({
                value: p.id,
                label: `${p.nom} - ${formaterMontant(p.prixVente)}`,
                produit: p,
            })),
        [produits],
    )

    const total = useMemo(
        () =>
            lignes.reduce((acc, l) => acc + (l.prixUnitaire * l.quantite || 0), 0),
        [lignes],
    )

    const handleChangeProduit = (index, option) => {
        setLignes((prev) => {
            const nouvelles = [...prev]
            if (option) {
                nouvelles[index] = {
                    ...nouvelles[index],
                    produitId: option.value,
                    prixUnitaire: option.produit.prixVente || 0,
                    produitSelectionne: option,
                }
            } else {
                nouvelles[index] = {
                    ...nouvelles[index],
                    produitId: null,
                    prixUnitaire: 0,
                    produitSelectionne: null,
                }
            }
            return nouvelles
        })
    }

    const handleChangeQuantite = (index, valeur) => {
        const quantite = parseInt(valeur) || 0
        setLignes((prev) => {
            const nouvelles = [...prev]
            nouvelles[index] = { ...nouvelles[index], quantite }
            return nouvelles
        })
    }

    const ajouterLigne = () => {
        setLignes((prev) => [...prev, ligneVide()])
    }

    const supprimerLigne = (index) => {
        if (lignes.length <= 1) return
        setLignes((prev) => prev.filter((_, i) => i !== index))
    }

    const valider = async (e) => {
        e.preventDefault()
        setErreur('')

        const lignesValides = lignes.filter((l) => l.produitId && l.quantite > 0)
        if (lignesValides.length === 0) {
            setErreur('Ajoutez au moins un produit')
            return
        }

        if (type === TYPES_VENTE.ECHEANCE && !clientSelectionne) {
            setErreur('Le client est obligatoire pour une vente à échéance')
            return
        }

        if (type === TYPES_VENTE.ECHEANCE && (!nombreEcheances || parseInt(nombreEcheances) <= 0)) {
            setErreur('Le nombre d\'échéances est obligatoire')
            return
        }

        if (type === TYPES_VENTE.ECHEANCE && !dateDebutEcheances) {
            setErreur('La date de début des échéances est obligatoire')
            return
        }

        setSoumission(true)

        try {
            const donnees = {
                typeVente: type,
                clientId: clientSelectionne?.value || undefined,
                lignes: lignesValides.map((l) => ({
                    produitId: l.produitId,
                    quantite: l.quantite,
                    prixUnitaire: l.prixUnitaire,
                })),
            }

            if (type === TYPES_VENTE.COMPTANT) {
                donnees.modePaiement = modePaiement.value
            } else {
                donnees.acompte = parseFloat(acompte) || 0
                donnees.nombreEcheances = parseInt(nombreEcheances)
                donnees.dateDebutEcheances = dateDebutEcheances
            }

            const resp = await creerVente(boutiqueId, donnees)
            const venteId = resp.data.donnees.id
            navigate(`/boutiques/${boutiqueId}/ventes/${venteId}`)
        } catch {
            setErreur('Erreur lors de la création de la vente')
        } finally {
            setSoumission(false)
        }
    }

    if (chargement) {
        return <Loading loading={true} />
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate(-1)}
                />
                <h2 className="text-2xl font-bold">Nouvelle vente</h2>
            </div>

            {erreur && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {erreur}
                </div>
            )}

            <Form onSubmit={valider}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1 - Type de vente */}
                        <Card>
                            <h5 className="font-bold mb-4">Type de vente</h5>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant={type === TYPES_VENTE.COMPTANT ? 'solid' : 'default'}
                                    onClick={() => setType(TYPES_VENTE.COMPTANT)}
                                >
                                    Comptant
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === TYPES_VENTE.ECHEANCE ? 'solid' : 'default'}
                                    onClick={() => setType(TYPES_VENTE.ECHEANCE)}
                                >
                                    Échéance
                                </Button>
                            </div>
                        </Card>

                        {/* Section 2 - Client */}
                        <Card>
                            <h5 className="font-bold mb-4">
                                Client
                                {type === TYPES_VENTE.ECHEANCE && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </h5>
                            <Select
                                placeholder="Sélectionner un client..."
                                options={optionsClients}
                                value={clientSelectionne}
                                onChange={setClientSelectionne}
                                isClearable
                            />
                        </Card>

                        {/* Section 3 - Produits */}
                        <Card>
                            <h5 className="font-bold mb-4">Produits</h5>
                            <div className="space-y-4">
                                {lignes.map((ligne, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                                    >
                                        <div className="flex-1 w-full">
                                            <label className="text-sm text-gray-500 mb-1 block">
                                                Produit
                                            </label>
                                            <Select
                                                placeholder="Choisir un produit..."
                                                options={optionsProduits}
                                                value={ligne.produitSelectionne}
                                                onChange={(option) => handleChangeProduit(index, option)}
                                                isClearable
                                            />
                                        </div>
                                        <div className="w-full sm:w-24">
                                            <label className="text-sm text-gray-500 mb-1 block">
                                                Quantité
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={ligne.quantite}
                                                onChange={(e) => handleChangeQuantite(index, e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full sm:w-32">
                                            <label className="text-sm text-gray-500 mb-1 block">
                                                Prix unitaire
                                            </label>
                                            <div className="py-2 font-medium">
                                                {formaterMontant(ligne.prixUnitaire)}
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-36">
                                            <label className="text-sm text-gray-500 mb-1 block">
                                                Sous-total
                                            </label>
                                            <div className="py-2 font-bold">
                                                {formaterMontant(ligne.prixUnitaire * ligne.quantite)}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="plain"
                                            size="sm"
                                            color="red"
                                            icon={<HiOutlineTrash />}
                                            onClick={() => supprimerLigne(index)}
                                            disabled={lignes.length <= 1}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    icon={<HiOutlinePlus />}
                                    onClick={ajouterLigne}
                                >
                                    Ajouter un produit
                                </Button>
                                <div className="text-xl font-bold">
                                    Total : {formaterMontant(total)}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Section 4 - Paiement */}
                    <div className="space-y-6">
                        <Card>
                            <h5 className="font-bold mb-4">Paiement</h5>

                            {type === TYPES_VENTE.COMPTANT ? (
                                <FormItem label="Mode de paiement">
                                    <Select
                                        options={optionsModesPaiement}
                                        value={modePaiement}
                                        onChange={setModePaiement}
                                    />
                                </FormItem>
                            ) : (
                                <>
                                    <FormItem label="Acompte">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={acompte}
                                            onChange={(e) => setAcompte(e.target.value)}
                                            placeholder="Montant de l'acompte"
                                        />
                                    </FormItem>

                                    <FormItem label="Nombre d'échéances *">
                                        <Input
                                            type="number"
                                            min={1}
                                            value={nombreEcheances}
                                            onChange={(e) => setNombreEcheances(e.target.value)}
                                            placeholder="Ex: 3"
                                        />
                                    </FormItem>

                                    <FormItem label="Date de début des échéances *">
                                        <Input
                                            type="date"
                                            value={dateDebutEcheances}
                                            onChange={(e) => setDateDebutEcheances(e.target.value)}
                                        />
                                    </FormItem>
                                </>
                            )}
                        </Card>

                        <Card>
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-2">Montant total</p>
                                <p className="text-2xl font-bold mb-4">
                                    {formaterMontant(total)}
                                </p>
                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={soumission}
                                    block
                                >
                                    Valider la vente
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default NouvelleVente
