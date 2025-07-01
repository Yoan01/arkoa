import { useMutation, useQueryClient } from '@tanstack/react-query'

import { InviteMemberInput } from '@/schemas/invite-member-schema'

export const useInviteMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string
      data: InviteMemberInput
    }) => {
      const res = await fetch(`/api/companies/${companyId}/memberships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Erreur lors de l'invitation")
      }

      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['company', variables.companyId, 'members'],
      })
    },
  })
}
