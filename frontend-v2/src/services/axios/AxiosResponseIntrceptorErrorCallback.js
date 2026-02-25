import { useSessionUser, useToken } from '@/store/authStore'

const unauthorizedCode = [401, 419, 440]

const AxiosResponseIntrceptorErrorCallback = (error) => {
    const { response } = error
    const { setToken } = useToken()

    if (response && unauthorizedCode.includes(response.status)) {
        setToken('')
        useSessionUser.getState().setUser({})
        useSessionUser.getState().setSessionSignedIn(false)
        localStorage.removeItem('kalis_token')
        localStorage.removeItem('kalis_utilisateur')
        localStorage.removeItem('kalis_boutique')
    }
}

export default AxiosResponseIntrceptorErrorCallback
