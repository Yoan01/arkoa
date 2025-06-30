import { useQuery } from '@tanstack/react-query'

export function useLeaveBalance(userId?: string) {
  const url = userId
    ? `/api/users/${userId}/leave-balance`
    : '/api/me/leave-balance'

  return useQuery({
    queryKey: ['leave-balance', userId ?? 'me', url],
    queryFn: async () => {
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
      return res.json()
    },
  })
}
