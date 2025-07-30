'use client'

import { useQuery } from '@tanstack/react-query'

import {
  GetCompanyLeavesParams,
  GetCompanyLeavesResponse,
} from '@/schemas/queries/company-leaves-schema'

export function useGetCompanyLeaves({
  companyId,
  status,
}: GetCompanyLeavesParams) {
  return useQuery({
    queryKey: ['company-leaves', companyId, status],
    queryFn: async (): Promise<GetCompanyLeavesResponse> => {
      const url = status
        ? `/api/companies/${companyId}/leaves?status=${status}`
        : `/api/companies/${companyId}/leaves`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des congés de l'entreprise"
        )
      }
      return response.json()
    },
    enabled: !!companyId,
  })
}
