import { StateCreator } from 'zustand'

import { Company } from '@/generated/prisma'

type ActiveCompanySlice = {
  activeCompany: Company | null
  setActiveCompany: (company: Company | null) => void
}
const activeCompanySlice: StateCreator<ActiveCompanySlice> = set => ({
  activeCompany: null,
  setActiveCompany: company => {
    set({ activeCompany: company })
  },
})

export default activeCompanySlice
export type { ActiveCompanySlice }
