import { lazy } from 'react'

const authRoute = [
    {
        key: 'signIn',
        path: `/connexion`,
        component: lazy(() => import('@/views/auth/SignIn')),
        authority: [],
    },
    {
        key: 'signUp',
        path: `/inscription`,
        component: lazy(() => import('@/views/auth/SignUp')),
        authority: [],
    },
]

export default authRoute
