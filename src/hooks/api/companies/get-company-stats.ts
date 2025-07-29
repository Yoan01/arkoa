import { useQuery } from '@tanstack/react-query'

import { CompanyStats } from '@/schemas/company-stats-schema'

export const useGetCompanyStats = (companyId?: string) => {
  return useQuery({
    queryKey: ['company-stats', companyId],
    queryFn: async (): Promise<CompanyStats> => {
      if (!companyId) {
        throw new Error('Aucune entreprise sélectionnée')
      }

      const res = await fetch(`/api/companies/${companyId}/stats`, {
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error || 'Erreur lors de la récupération des statistiques'
        )
      }

      return res.json()
    },
    enabled: !!companyId,
    refetchInterval: 5 * 60 * 1000,
  })
}
