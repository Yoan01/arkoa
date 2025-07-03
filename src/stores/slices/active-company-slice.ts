import { StateCreator } from 'zustand'

import { Company } from '@/generated/prisma'
import { SetActiveMembershipInput } from '@/schemas/set-active-membership-schema'

type ActiveCompanySlice = {
  activeCompany: Company | null
  isLoading: boolean
  fetchActiveCompany: () => Promise<void>
  setActiveMembership: (membershipId: SetActiveMembershipInput) => void
  setActiveCompany: (company: Company) => void
}
const activeCompanySlice: StateCreator<ActiveCompanySlice> = set => ({
  activeCompany: null,
  isLoading: false,
  fetchActiveCompany: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/users/active-membership')
      const data = await res.json()
      set({ activeCompany: data, isLoading: false })
    } catch (err) {
      console.error('Erreur de récupération', err)
      set({ isLoading: false })
    }
  },
  setActiveMembership: async (membershipId: SetActiveMembershipInput) => {
    set({ isLoading: true })
    try {
      const res = await fetch(`/api/users/active-membership`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(membershipId),
      })
      const updatedCompany = await res.json()

      set({ activeCompany: updatedCompany, isLoading: false })
    } catch (err) {
      console.error('Erreur de mise à jour', err)
      set({ isLoading: false })
    }
  },
  setActiveCompany: (company: Company) => {
    set({ activeCompany: company })
  },
})

export default activeCompanySlice
export type { ActiveCompanySlice }
