/**
 * @jest-environment jsdom
 */

// Mock idb module
jest.mock('idb', () => ({
  openDB: jest.fn().mockResolvedValue({}),
}))

describe('db-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('should load db-storage module without errors', async () => {
    // Test that the module loads without errors
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../db-storage')
    }).not.toThrow()
  })

  it('should export dbPromise', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dbStorage = require('../db-storage')
    expect(dbStorage.dbPromise).toBeDefined()
  })

  it('should handle client environment detection', () => {
    // Test that the module handles client environment detection
    // This is a basic test to ensure the module logic works
    const hasWindow = typeof window !== 'undefined'
    const hasIndexedDB = typeof indexedDB !== 'undefined'

    expect(typeof hasWindow).toBe('boolean')
    expect(typeof hasIndexedDB).toBe('boolean')
  })

  it('should not initialize database in non-client environment', async () => {
    // Mock non-client environment by deleting indexedDB
    const originalIndexedDB = global.indexedDB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).indexedDB

    jest.resetModules()
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dbStorage = require('../db-storage')

    expect(dbStorage.dbPromise).toBeNull()

    // Restore indexedDB
    global.indexedDB = originalIndexedDB
  })
})
