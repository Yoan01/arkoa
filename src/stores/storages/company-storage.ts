import { dbPromise } from './db-storage'

const COMPANY_DB_FILE = 'company'

type StorageValue<T> = { state: T }

type State = {
  range?: string
  show: boolean
}

export const companyStorage = {
  getItem: async (
    name: string
  ): Promise<StorageValue<Partial<State>> | null> => {
    const db = await dbPromise
    const value = await db?.get(COMPANY_DB_FILE, name)
    return value ? JSON.parse(value) : null
  },
  setItem: async (
    name: string,
    value: StorageValue<Partial<State>>
  ): Promise<void> => {
    const db = await dbPromise
    await db?.put(COMPANY_DB_FILE, JSON.stringify(value), name)
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await dbPromise
    await db?.delete(COMPANY_DB_FILE, name)
  },
}
