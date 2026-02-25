import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const validationSchema = z
    .object({
        nom: z.string().min(1, { message: 'Veuillez saisir votre nom' }),
        email: z
            .string()
            .min(1, { message: 'Veuillez saisir votre email' })
            .email({ message: 'Email invalide' }),
        telephone: z.string().optional(),
        motDePasse: z
            .string()
            .min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
        confirmationMotDePasse: z
            .string()
            .min(1, { message: 'Veuillez confirmer le mot de passe' }),
    })
    .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmationMotDePasse'],
    })

const SignUpForm = (props) => {
    const { disableSubmit = false, className, setMessage } = props

    const [isSubmitting, setSubmitting] = useState(false)

    const { signUp } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
    })

    const onSignUp = async (values) => {
        const { nom, email, telephone, motDePasse } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({ nom, email, telephone, motDePasse })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }

            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignUp)}>
                <FormItem
                    label="Nom complet"
                    invalid={Boolean(errors.nom)}
                    errorMessage={errors.nom?.message}
                >
                    <Controller
                        name="nom"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="Votre nom"
                                autoComplete="name"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="votre@email.com"
                                autoComplete="email"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Téléphone"
                    invalid={Boolean(errors.telephone)}
                    errorMessage={errors.telephone?.message}
                >
                    <Controller
                        name="telephone"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="tel"
                                placeholder="Numéro de téléphone"
                                autoComplete="tel"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Mot de passe"
                    invalid={Boolean(errors.motDePasse)}
                    errorMessage={errors.motDePasse?.message}
                >
                    <Controller
                        name="motDePasse"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="new-password"
                                placeholder="Mot de passe"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Confirmation"
                    invalid={Boolean(errors.confirmationMotDePasse)}
                    errorMessage={errors.confirmationMotDePasse?.message}
                >
                    <Controller
                        name="confirmationMotDePasse"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirmer le mot de passe"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'Création...' : 'Créer mon compte'}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
