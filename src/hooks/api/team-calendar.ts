import { useQuery } from '@tanstack/react-query'

export function useTeamCalendar(companyId: string, month: string) {
  return useQuery({
    queryKey: ['calendar', companyId, month],
    queryFn: async () => {
      const res = await fetch(
        `/api/companies/${companyId}/calendar?month=${month}`,
        {
          credentials: 'include',
        }
      )
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
      return res.json()
    },
    enabled: !!companyId && !!month,
  })
}
