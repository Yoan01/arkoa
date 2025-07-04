import { StateCreator } from 'zustand'

import { Company, UserRole } from '@/generated/prisma'

export type IActiveCompany =
  | (Company & { userMembershipId: string; userRole: UserRole })
  | null

type ActiveCompanySlice = {
  activeCompany: IActiveCompany
  setActiveCompany: (company: IActiveCompany) => void
}
const activeCompanySlice: StateCreator<ActiveCompanySlice> = set => ({
  activeCompany: null,
  setActiveCompany: company => {
    set({ activeCompany: company })
  },
})

export default activeCompanySlice
export type { ActiveCompanySlice }
