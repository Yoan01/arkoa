'use client'

import { useQuery } from '@tanstack/react-query'

import {
  GetLeaveStatsParams,
  LeaveStatsResponse,
} from '@/schemas/queries/leave-stats-schema'

export function useGetLeaveStats({ companyId }: GetLeaveStatsParams) {
  return useQuery({
    queryKey: ['leave-stats', companyId],
    queryFn: async (): Promise<LeaveStatsResponse> => {
      const response = await fetch(`/api/companies/${companyId}/leaves/stats`)
      if (!response.ok) {
        throw new Error(
          'Erreur lors de la récupération des statistiques de congés'
        )
      }
      return response.json()
    },
    enabled: !!companyId,
  })
}
