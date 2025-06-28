import { headers } from 'next/headers'

import { auth as betterAuth } from '@/lib/auth'

// Fonction simple pour récupérer la session
export async function getAuth() {
  return await betterAuth.api.getSession({
    headers: await headers(),
  })
}

// Fonction qui vérifie l'authentification
export async function requireAuth() {
  const auth = await getAuth()

  if (!auth?.user) {
    throw new Error('Utilisateur non authentifié')
  }

  return auth
}

// Hook personnalisé pour les composants serveur
export async function useServerSession() {
  const auth = await getAuth()

  return {
    session: auth?.session || null,
    user: auth?.user || null,
    isAuthenticated: !!auth?.user,
  }
}
