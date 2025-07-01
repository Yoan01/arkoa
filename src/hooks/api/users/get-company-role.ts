'use client'

import { useQuery } from '@tanstack/react-query'

import { UserCompanyRoleInput } from '@/schemas/queries/company-role-schema'

export const useGetCompanyRole = (companyId?: string) => {
  return useQuery<UserCompanyRoleInput>({
    queryKey: ['user-company-role', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const res = await fetch(`/api/users/company-role?companyId=${companyId}`)

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error || 'Erreur lors de la récupération du rôle'
        )
      }

      return res.json()
    },
  })
}
