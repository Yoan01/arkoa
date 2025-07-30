'use client'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { UserCompanyInput } from '@/schemas/queries/user-company-schema'

type UseGetCompaniesOptions = Omit<
  UseQueryOptions<UserCompanyInput[]>,
  'queryKey' | 'queryFn'
>

export const useGetCompanies = (options?: UseGetCompaniesOptions) => {
  return useQuery<UserCompanyInput[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies', { credentials: 'include' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
      return res.json()
    },
    ...options,
  })
}
