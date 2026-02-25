import { useRef, useImperativeHandle, useState, useEffect } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import { getProfil } from '@/services/kalis/authApi'

const IsolatedNavigator = ({ ref }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

function AuthProvider({ children }) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const { token, setToken } = useToken()
    const [tokenState, setTokenState] = useState(token)

    const authenticated = Boolean(tokenState && signedIn)

    const navigatorRef = useRef(null)

    useEffect(() => {
        const validateToken = async () => {
            if (token && !signedIn) {
                try {
                    const resp = await getProfil()
                    const utilisateur = resp.data.donnees
                    setUser({
                        userName: utilisateur.nom,
                        email: utilisateur.email,
                        authority: [utilisateur.role || 'super_admin'],
                        userId: utilisateur.id,
                        telephone: utilisateur.telephone,
                    })
                    setSessionSignedIn(true)
                } catch {
                    setToken('')
                    setTokenState('')
                    localStorage.removeItem('kalis_token')
                    localStorage.removeItem('kalis_utilisateur')
                }
            }
        }
        validateToken()
    }, [])

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const handleSignIn = (tokens, userData) => {
        setToken(tokens.accessToken)
        setTokenState(tokens.accessToken)
        setSessionSignedIn(true)

        if (userData) {
            setUser(userData)
            localStorage.setItem('kalis_utilisateur', JSON.stringify(userData))
        }
    }

    const handleSignOut = () => {
        setToken('')
        setTokenState('')
        setUser({})
        setSessionSignedIn(false)
        localStorage.removeItem('kalis_token')
        localStorage.removeItem('kalis_utilisateur')
        localStorage.removeItem('kalis_boutique')
    }

    const signIn = async (values) => {
        try {
            const resp = await apiSignIn(values)
            if (resp && resp.donnees) {
                const { token: accessToken, utilisateur } = resp.donnees
                handleSignIn(
                    { accessToken },
                    {
                        userName: utilisateur.nom,
                        email: utilisateur.email,
                        authority: [utilisateur.role || 'super_admin'],
                        userId: utilisateur.id,
                        telephone: utilisateur.telephone,
                    },
                )
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Impossible de se connecter',
            }
        } catch (errors) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values) => {
        try {
            const resp = await apiSignUp(values)
            if (resp && resp.donnees) {
                const { token: accessToken, utilisateur } = resp.donnees
                handleSignIn(
                    { accessToken },
                    {
                        userName: utilisateur.nom,
                        email: utilisateur.email,
                        authority: [utilisateur.role || 'super_admin'],
                        userId: utilisateur.id,
                        telephone: utilisateur.telephone,
                    },
                )
                redirect()
                return {
                    status: 'success',
                    message: '',
                }
            }
            return {
                status: 'failed',
                message: 'Impossible de créer le compte',
            }
        } catch (errors) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signOut = async () => {
        handleSignOut()
        navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
    }

    const oAuthSignIn = (callback) => {
        callback({
            onSignIn: handleSignIn,
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
