import { useQuery } from '@tanstack/react-query'

import { LeaveBalanceHistoryWithActorAndTypeInput } from '@/schemas/queries/leave-balance-history-whit-actor-and-type-schema'
import { useCompanyStore } from '@/stores/use-company-store'

export const useGetLeaveBalanceHistory = (membershipId: string) => {
  const { activeCompany } = useCompanyStore()

  return useQuery<LeaveBalanceHistoryWithActorAndTypeInput[]>({
    queryKey: ['leave-balance-history', activeCompany, membershipId],
    queryFn: async () => {
      if (!activeCompany) {
        throw new Error('Aucune entreprise sélectionnée')
      }

      const response = await fetch(
        `/api/companies/${activeCompany.id}/memberships/${membershipId}/leave-balance-history`
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique")
      }

      return await response.json()
    },
    enabled: !!activeCompany && !!membershipId,
  })
}
