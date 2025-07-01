'use client'

import { useMutation } from '@tanstack/react-query'

import { Company } from '@/generated/prisma'

export const useUpdateCompany = () => {
  return useMutation({
    mutationFn: async (data: Company) => {
      const res = await fetch(`/api/companies/${data.id}`, {
        method: 'PUT',
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
      return res.json()
    },
  })
}
