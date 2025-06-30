import { headers } from 'next/headers'

import { auth as betterAuth } from '@/lib/auth'

export async function getAuth() {
  return await betterAuth.api.getSession({
    headers: await headers(),
  })
}

export async function requireAuth() {
  const auth = await getAuth()

  if (!auth?.user) {
    throw new Error('Utilisateur non authentifié')
  }

  return auth
}

export async function getUser() {
  const auth = await getAuth()

  return {
    session: auth?.session || null,
    user: auth?.user || null,
    isAuthenticated: !!auth?.user,
  }
}
