import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ companyId }: { companyId: string }) => {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
