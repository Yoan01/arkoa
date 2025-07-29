'use client'

import { useQuery } from '@tanstack/react-query'

import { MembershipWithUserAndBalances } from '@/schemas/edit-leave-balance-dialog-schema'

export const useGetMemberships = (companyId: string) => {
  return useQuery<MembershipWithUserAndBalances[]>({
    queryKey: ['memberships', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/memberships`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
      return res.json()
    },
    enabled: !!companyId,
  })
}
