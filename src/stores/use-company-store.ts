import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import activeCompanySlice, {
  ActiveCompanySlice,
} from './slices/active-company-slice'
import { companyStorage } from './storages/company-storage'

export const useCompanyStore = create<ActiveCompanySlice>()(
  persist(
    (set, get, store) => ({
      ...activeCompanySlice(set, get, store),
    }),
    {
      name: 'company',
      storage: companyStorage,
    }
  )
)
