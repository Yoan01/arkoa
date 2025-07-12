'use client'

import { useQuery } from '@tanstack/react-query'

import { Leave } from '@/generated/prisma'

export const useGetLeaves = ({
  companyId,
  membershipId,
}: {
  companyId: string
  membershipId: string
}) => {
  return useQuery<Leave[]>({
    queryKey: ['my-leaves', companyId, membershipId],
    queryFn: async () => {
      const res = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}/leaves`,
        { credentials: 'include' }
      )
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
      return res.json()
    },
  })
}
