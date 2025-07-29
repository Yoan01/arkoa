import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UpdateLeaveBalanceInput } from '@/schemas/update-leave-balance-schema'

type UpdateLeaveBalanceParams = {
  data: UpdateLeaveBalanceInput
  companyId: string
  membershipId: string
}

export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      companyId,
      membershipId,
    }: UpdateLeaveBalanceParams) => {
      const res = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}/leave-balances`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          errorData.error || 'Erreur lors de la modification du solde de congés'
        )
      }

      return res.json()
    },

    onSuccess: (_data, variables) => {
      // Invalider les requêtes liées aux soldes de congés
      queryClient.invalidateQueries({
        queryKey: [
          'leave-balances',
          variables.companyId,
          variables.membershipId,
        ],
      })
      // Invalider aussi les memberships pour rafraîchir la table HR
      queryClient.invalidateQueries({
        queryKey: ['memberships', variables.companyId],
      })
      // Invalider les statistiques d'entreprise car le solde moyen peut avoir changé
      queryClient.invalidateQueries({
        queryKey: ['company-stats', variables.companyId],
      })
    },
  })
}
