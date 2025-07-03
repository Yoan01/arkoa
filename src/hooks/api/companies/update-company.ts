'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Company } from '@/generated/prisma'
import { UpdateCompanyInput } from '@/schemas/update-company-schema'

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCompanyInput) => {
      const res = await fetch(`/api/companies/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
      return res.json() as Promise<Company>
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['companies'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['active-company'],
        }),
      ])
    },
  })
}
