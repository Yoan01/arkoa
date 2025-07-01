import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SetActiveMembershipInput } from '@/schemas/set-active-membership-schema'

export const useSetActiveCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ membershipId }: SetActiveMembershipInput) => {
      const res = await fetch('/api/users/active-membership', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ membershipId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-company'] })
    },
  })
}
