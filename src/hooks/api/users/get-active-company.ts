'use client'

import { useQuery } from '@tanstack/react-query'

import { Company } from '@/generated/prisma'

export const useGetActiveCompany = () => {
  return useQuery<Company | null>({
    queryKey: ['active-company'],
    queryFn: async () => {
      const res = await fetch('/api/users/active-membership')

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }

      return res.json()
    },
  })
}
