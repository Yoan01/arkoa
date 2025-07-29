import { useQuery } from '@tanstack/react-query'

import { MembershipWithUserAndCompanyInput } from '@/schemas/queries/membership-with-user-and-company-schema'

export function useGetMembership(companyId: string, membershipId: string) {
  return useQuery<MembershipWithUserAndCompanyInput>({
    queryKey: ['membership', companyId, membershipId],
    queryFn: async () => {
      const response = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || 'Erreur lors du chargement du membre'
        )
      }

      return response.json()
    },
    enabled: !!companyId && !!membershipId,
  })
}
