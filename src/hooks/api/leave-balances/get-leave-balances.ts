'use client'

import { useQuery } from '@tanstack/react-query'

import { LeaveBalance } from '@/generated/prisma'

export function useGetLeaveBalances(companyId: string, membershipId: string) {
  return useQuery<LeaveBalance[]>({
    queryKey: ['leave-balances', companyId, membershipId],
    queryFn: async () => {
      const res = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}/leave-balances`,
        {
          credentials: 'include',
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error ||
            'Erreur lors de la récupération des soldes de congés'
        )
      }

      return res.json()
    },
    enabled: !!companyId && !!membershipId,
  })
}
