import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UpdateLeaveInput } from '@/schemas/update-leave-schema'

type UpdateLeaveParams = {
  data: Partial<UpdateLeaveInput>
  companyId: string
  membershipId: string
  leaveId: string
}

export const useUpdateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      companyId,
      membershipId,
      leaveId,
    }: UpdateLeaveParams) => {
      const res = await fetch(
        `/api/companies/${companyId}/memberships/${membershipId}/leaves/${leaveId}`,
        {
          method: 'PATCH',
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
          errorData.error || 'Erreur lors de la modification du congé'
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
