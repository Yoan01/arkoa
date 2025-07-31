import { setupServer } from 'msw/node'

import { handlers } from './handlers'

// Configuration du serveur MSW pour les tests Node.js
export const server = setupServer(...handlers)
