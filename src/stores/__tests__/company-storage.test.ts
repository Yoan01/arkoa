// Mock IndexedDB
jest.mock('../storages/db-storage', () => ({
  dbPromise: Promise.resolve({
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }),
}))

import { companyStorage } from '../storages/company-storage'
import { dbPromise } from '../storages/db-storage'

interface MockDbInstance {
  get: jest.MockedFunction<
    (storeName: string, key: string) => Promise<string | null>
  >
  put: jest.MockedFunction<
    (storeName: string, value: string, key: string) => Promise<void>
  >
  delete: jest.MockedFunction<(storeName: string, key: string) => Promise<void>>
}

describe('companyStorage', () => {
  let mockDbInstance: MockDbInstance

  beforeEach(async () => {
    jest.clearAllMocks()
    mockDbInstance = (await dbPromise) as unknown as MockDbInstance
  })

  describe('getItem', () => {
    it('should return parsed value when item exists', async () => {
      const mockValue = { state: { range: '2024-01-01', show: true } }
      const serializedValue = JSON.stringify(mockValue)

      mockDbInstance.get.mockResolvedValue(serializedValue)

      const result = await companyStorage.getItem('test-key')

      expect(result).toEqual(mockValue)
      expect(mockDbInstance.get).toHaveBeenCalledWith('company', 'test-key')
    })

    it('should return null when item does not exist', async () => {
      mockDbInstance.get.mockResolvedValue(null)

      const result = await companyStorage.getItem('non-existent-key')

      expect(mockDbInstance.get).toHaveBeenCalledWith(
        'company',
        'non-existent-key'
      )
      expect(result).toBeNull()
    })

    it('should return null when item is null', async () => {
      mockDbInstance.get.mockResolvedValue(null)

      const result = await companyStorage.getItem('null-key')

      expect(mockDbInstance.get).toHaveBeenCalledWith('company', 'null-key')
      expect(result).toBeNull()
    })

    it('should handle JSON parsing correctly', async () => {
      const complexValue = {
        state: {
          range: '2024-01-01/2024-12-31',
          show: false,
          nested: {
            data: 'test',
            number: 42,
          },
        },
      }
      const serializedValue = JSON.stringify(complexValue)

      mockDbInstance.get.mockResolvedValue(serializedValue)

      const result = await companyStorage.getItem('complex-key')

      expect(result).toEqual(complexValue)
    })

    it('should handle empty string value', async () => {
      mockDbInstance.get.mockResolvedValue('')

      const result = await companyStorage.getItem('empty-key')

      expect(result).toBeNull()
    })
  })

  describe('setItem', () => {
    it('should store serialized value correctly', async () => {
      const value = { state: { range: '2024-01-01', show: true } }
      const expectedSerialized = JSON.stringify(value)

      await companyStorage.setItem('test-key', value)

      expect(mockDbInstance.put).toHaveBeenCalledWith(
        'company',
        expectedSerialized,
        'test-key'
      )
    })

    it('should handle complex nested objects', async () => {
      const complexValue = {
        state: {
          range: '2024-01-01/2024-12-31',
          show: false,
          settings: {
            theme: 'dark',
            notifications: true,
            data: {
              lastSync: '2024-01-01T00:00:00Z',
              version: 1,
            },
          },
        },
      }
      const expectedSerialized = JSON.stringify(complexValue)

      await companyStorage.setItem('complex-key', complexValue)

      expect(mockDbInstance.put).toHaveBeenCalledWith(
        'company',
        expectedSerialized,
        'complex-key'
      )
    })

    it('should handle partial state objects', async () => {
      const partialValue = { state: { show: true } }
      const expectedSerialized = JSON.stringify(partialValue)

      await companyStorage.setItem('partial-key', partialValue)

      expect(mockDbInstance.put).toHaveBeenCalledWith(
        'company',
        expectedSerialized,
        'partial-key'
      )
    })

    it('should handle empty state', async () => {
      const emptyValue = { state: {} }
      const expectedSerialized = JSON.stringify(emptyValue)

      await companyStorage.setItem('empty-key', emptyValue)

      expect(mockDbInstance.put).toHaveBeenCalledWith(
        'company',
        expectedSerialized,
        'empty-key'
      )
    })
  })

  describe('removeItem', () => {
    it('should delete item with correct parameters', async () => {
      await companyStorage.removeItem('test-key')

      expect(mockDbInstance.delete).toHaveBeenCalledWith('company', 'test-key')
    })

    it('should handle multiple delete operations', async () => {
      await companyStorage.removeItem('key1')
      await companyStorage.removeItem('key2')
      await companyStorage.removeItem('key3')

      expect(mockDbInstance.delete).toHaveBeenCalledTimes(3)
      expect(mockDbInstance.delete).toHaveBeenNthCalledWith(
        1,
        'company',
        'key1'
      )
      expect(mockDbInstance.delete).toHaveBeenNthCalledWith(
        2,
        'company',
        'key2'
      )
      expect(mockDbInstance.delete).toHaveBeenNthCalledWith(
        3,
        'company',
        'key3'
      )
    })

    it('should handle deletion of non-existent keys', async () => {
      // IndexedDB delete operations typically don't throw for non-existent keys
      await expect(
        companyStorage.removeItem('non-existent-key')
      ).resolves.not.toThrow()

      expect(mockDbInstance.delete).toHaveBeenCalledWith(
        'company',
        'non-existent-key'
      )
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete storage lifecycle', async () => {
      const testValue = { state: { range: '2024-01-01', show: true } }
      const testKey = 'lifecycle-test'

      // Set item
      await companyStorage.setItem(testKey, testValue)
      expect(mockDbInstance.put).toHaveBeenCalledWith(
        'company',
        JSON.stringify(testValue),
        testKey
      )

      // Get item
      mockDbInstance.get.mockResolvedValue(JSON.stringify(testValue))
      const retrievedValue = await companyStorage.getItem(testKey)
      expect(retrievedValue).toEqual(testValue)

      // Remove item
      await companyStorage.removeItem(testKey)
      expect(mockDbInstance.delete).toHaveBeenCalledWith('company', testKey)
    })

    it('should handle concurrent operations', async () => {
      const promises = [
        companyStorage.setItem('key1', { state: { show: true } }),
        companyStorage.setItem('key2', { state: { show: false } }),
        companyStorage.removeItem('key3'),
      ]

      await Promise.all(promises)

      expect(mockDbInstance.put).toHaveBeenCalledTimes(2)
      expect(mockDbInstance.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      mockDbInstance.get.mockRejectedValue(dbError)

      await expect(companyStorage.getItem('test-key')).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle put operation errors', async () => {
      const dbError = new Error('Storage quota exceeded')
      mockDbInstance.put.mockRejectedValue(dbError)

      await expect(
        companyStorage.setItem('test-key', { state: { show: true } })
      ).rejects.toThrow('Storage quota exceeded')
    })

    it('should handle delete operation errors', async () => {
      const dbError = new Error('Delete operation failed')
      mockDbInstance.delete.mockRejectedValue(dbError)

      await expect(companyStorage.removeItem('test-key')).rejects.toThrow(
        'Delete operation failed'
      )
    })
  })
})
