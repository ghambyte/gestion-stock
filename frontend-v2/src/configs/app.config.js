const appConfig = {
    apiPrefix: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    authenticatedEntryPath: '/boutiques',
    unAuthenticatedEntryPath: '/connexion',
    locale: 'fr',
    accessTokenPersistStrategy: 'localStorage',
    enableMock: false,
    activeNavTranslation: false,
}

export default appConfig
