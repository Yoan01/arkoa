import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CreateLeaveInput } from '@/schemas/create-leave-schema'

type CreateLeaveParams = {
  data: CreateLeaveInput
  companyId: string
  membershipId: string
}

export const useCreateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      companyId,
      membershipId,
    }: CreateLeaveParams) => {
      const res = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}/leaves`,
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
          errorData.error || 'Erreur lors de la création du congé'
        )
      }

      return res.json()
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['leaves', variables.companyId, variables.membershipId],
      })
    },
  })
}
