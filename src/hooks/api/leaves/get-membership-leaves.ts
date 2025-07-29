import { useQuery } from '@tanstack/react-query'

import { Leave } from '@/generated/prisma'

export function useGetMembershipLeaves(
  companyId: string,
  membershipId: string
) {
  return useQuery<Leave[]>({
    queryKey: ['membership-leaves', companyId, membershipId],
    queryFn: async () => {
      const res = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}/leaves`
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }

      return res.json()
    },
    enabled: !!companyId && !!membershipId,
  })
}
