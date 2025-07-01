'use client'

import { useQuery } from '@tanstack/react-query'

import { Company } from '@/generated/prisma'

export const useGetCompany = (companyId: string) => {
  return useQuery<Company>({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}`, {
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
