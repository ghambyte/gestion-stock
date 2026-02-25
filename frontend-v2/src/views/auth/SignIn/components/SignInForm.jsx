import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const validationSchema = z.object({
    email: z
        .string()
        .min(1, { message: 'Veuillez saisir votre email' })
        .email({ message: 'Email invalide' }),
    motDePasse: z
        .string()
        .min(1, { message: 'Veuillez saisir votre mot de passe' }),
})

const SignInForm = (props) => {
    const [isSubmitting, setSubmitting] = useState(false)

    const { disableSubmit = false, className, setMessage } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: {
            email: '',
            motDePasse: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values) => {
        const { email, motDePasse } = values

        if (!disableSubmit) {
            setSubmitting(true)

            const result = await signIn({ email, motDePasse })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onSignIn)}>
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
                    label="Mot de passe"
                    invalid={Boolean(errors.motDePasse)}
                    errorMessage={errors.motDePasse?.message}
                >
                    <Controller
                        name="motDePasse"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="Mot de passe"
                                autoComplete="current-password"
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
                    {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
