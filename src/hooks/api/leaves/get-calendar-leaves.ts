'use client'

import { useQuery } from '@tanstack/react-query'

import {
  GetCalendarLeavesParams,
  GetCalendarLeavesResponse,
} from '@/schemas/queries/calendar-leaves-schema'

export function useGetCalendarLeaves({
  companyId,
  year,
  month,
}: GetCalendarLeavesParams) {
  return useQuery({
    queryKey: ['calendar-leaves', companyId, year, month],
    queryFn: async (): Promise<GetCalendarLeavesResponse> => {
      const searchParams = new URLSearchParams()

      if (year !== undefined) {
        searchParams.append('year', year.toString())
      }

      if (month !== undefined) {
        searchParams.append('month', month.toString())
      }

      const url = `/api/companies/${companyId}/calendar${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          'Erreur lors de la récupération des congés du calendrier'
        )
      }
      return response.json()
    },
    enabled: !!companyId,
  })
}
