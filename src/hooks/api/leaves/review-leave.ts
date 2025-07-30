'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { LeaveStatus } from '@/generated/prisma'
import { ReviewLeaveParams } from '@/schemas/queries/review-leave-schema'

export function useReviewLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      leaveId,
      action,
      managerNote,
    }: ReviewLeaveParams) => {
      const response = await fetch(
        `/api/companies/${companyId}/leaves/${leaveId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: action,
            managerNote,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.message || 'Erreur lors de la révision de la demande'
        )
      }

      return response.json()
    },
    onSuccess: (_, { action, companyId }) => {
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['company-leaves', companyId] })
      queryClient.invalidateQueries({ queryKey: ['leave-stats', companyId] })
      queryClient.invalidateQueries({ queryKey: ['leaves'] })

      toast.success(
        action === LeaveStatus.APPROVED
          ? 'Demande approuvée avec succès'
          : 'Demande rejetée avec succès'
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la révision de la demande')
    },
  })
}
