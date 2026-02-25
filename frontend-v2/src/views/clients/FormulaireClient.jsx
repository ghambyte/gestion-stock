import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Loading from '@/components/shared/Loading'
import { creerClient, detailClient, modifierClient } from '@/services/kalis/clientApi'
import { HiOutlineArrowLeft } from 'react-icons/hi'

const FormulaireClient = () => {
    const { boutiqueId, id } = useParams()
    const navigate = useNavigate()
    const estModification = Boolean(id)

    const [formulaire, setFormulaire] = useState({
        nom: '',
        telephone: '',
        email: '',
        adresse: '',
    })
    const [chargement, setChargement] = useState(estModification)
    const [soumission, setSoumission] = useState(false)
    const [erreur, setErreur] = useState('')

    useEffect(() => {
        if (estModification) {
            chargerClient()
        }
    }, [id])

    const chargerClient = async () => {
        try {
            const resp = await detailClient(boutiqueId, id)
            const client = resp.data.donnees
            setFormulaire({
                nom: client.nom || '',
                telephone: client.telephone || '',
                email: client.email || '',
                adresse: client.adresse || '',
            })
        } catch {
            setErreur('Impossible de charger les données du client')
        } finally {
            setChargement(false)
        }
    }

    const handleChange = (champ) => (e) => {
        setFormulaire((prev) => ({ ...prev, [champ]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formulaire.nom.trim()) {
            setErreur('Le nom est obligatoire')
            return
        }

        setSoumission(true)
        setErreur('')

        try {
            const donnees = {
                nom: formulaire.nom.trim(),
                telephone: formulaire.telephone.trim() || undefined,
                email: formulaire.email.trim() || undefined,
                adresse: formulaire.adresse.trim() || undefined,
            }

            if (estModification) {
                await modifierClient(boutiqueId, id, donnees)
                navigate(`/boutiques/${boutiqueId}/clients/${id}`)
            } else {
                const resp = await creerClient(boutiqueId, donnees)
                const nouveauClient = resp.data.donnees
                navigate(`/boutiques/${boutiqueId}/clients/${nouveauClient.id}`)
            }
        } catch {
            setErreur(
                estModification
                    ? 'Erreur lors de la modification du client'
                    : 'Erreur lors de la création du client'
            )
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
                <h2 className="text-2xl font-bold">
                    {estModification ? 'Modifier le client' : 'Nouveau client'}
                </h2>
            </div>

            <Card className="max-w-2xl">
                {erreur && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {erreur}
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <FormItem label="Nom *">
                        <Input
                            value={formulaire.nom}
                            onChange={handleChange('nom')}
                            placeholder="Nom du client"
                        />
                    </FormItem>

                    <FormItem label="Téléphone">
                        <Input
                            value={formulaire.telephone}
                            onChange={handleChange('telephone')}
                            placeholder="Numéro de téléphone"
                        />
                    </FormItem>

                    <FormItem label="Email">
                        <Input
                            type="email"
                            value={formulaire.email}
                            onChange={handleChange('email')}
                            placeholder="Adresse email"
                        />
                    </FormItem>

                    <FormItem label="Adresse">
                        <Input
                            textArea
                            value={formulaire.adresse}
                            onChange={handleChange('adresse')}
                            placeholder="Adresse du client"
                        />
                    </FormItem>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="plain"
                            onClick={() => navigate(-1)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            loading={soumission}
                        >
                            {estModification ? 'Enregistrer' : 'Créer le client'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default FormulaireClient
