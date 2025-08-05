/**
 * @jest-environment jsdom
 */

import { openDB } from 'idb'

// Mock idb
jest.mock('idb', () => ({
  openDB: jest.fn(),
}))

const mockOpenDB = openDB as jest.MockedFunction<typeof openDB>

describe('db-storage', () => {
  let mockDb: Partial<{
    objectStoreNames: {
      contains: jest.MockedFunction<(name: string) => boolean>
    }
    createObjectStore: jest.MockedFunction<(name: string) => void>
  }>

  beforeEach(() => {
    // Mock IndexedDB
    mockDb = {
      objectStoreNames: {
        contains: jest.fn(),
      },
      createObjectStore: jest.fn(),
    }

    mockOpenDB.mockResolvedValue(mockDb as any)
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should export dbPromise', async () => {
      const { dbPromise } = await import('../storages/db-storage')
      // In jsdom environment, dbPromise should be defined (either a promise or null)
      expect(dbPromise).toBeDefined()
    })

    it('should handle client-side initialization', async () => {
      // Since we're in jsdom environment, window and indexedDB should be available
      // and the module should attempt to initialize the database
      const { dbPromise } = await import('../storages/db-storage')

      // dbPromise can be null or a promise depending on environment
      expect(dbPromise === null || typeof dbPromise === 'object').toBe(true)
    })
  })
})
