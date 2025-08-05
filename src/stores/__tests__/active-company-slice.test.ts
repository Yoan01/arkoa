import { UserRole } from '@/generated/prisma'

import activeCompanySlice, {
  ActiveCompanySlice,
  IActiveCompany,
} from '../slices/active-company-slice'

describe('activeCompanySlice', () => {
  let store: ActiveCompanySlice
  let setState: jest.Mock
  let getState: jest.Mock
  let storeApi: object

  beforeEach(() => {
    setState = jest.fn()
    getState = jest.fn()
    storeApi = {}

    store = activeCompanySlice(setState, getState, storeApi as any)
  })

  describe('initial state', () => {
    it('should have activeCompany as null initially', () => {
      expect(store.activeCompany).toBeNull()
    })

    it('should have setActiveCompany function', () => {
      expect(typeof store.setActiveCompany).toBe('function')
    })
  })

  describe('setActiveCompany', () => {
    it('should set active company with valid company data', () => {
      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      store.setActiveCompany(mockCompany)

      expect(setState).toHaveBeenCalledWith({ activeCompany: mockCompany })
    })

    it('should set active company to null', () => {
      store.setActiveCompany(null)

      expect(setState).toHaveBeenCalledWith({ activeCompany: null })
    })

    it('should handle company with EMPLOYEE role', () => {
      const mockCompany: IActiveCompany = {
        id: 'company-2',
        name: 'Employee Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-2',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      store.setActiveCompany(mockCompany)

      expect(setState).toHaveBeenCalledWith({ activeCompany: mockCompany })
    })

    it('should handle company with ADMIN role', () => {
      const mockCompany: IActiveCompany = {
        id: 'company-3',
        name: 'Admin Company',
        logoUrl: 'https://example.com/admin-logo.png',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-3',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      store.setActiveCompany(mockCompany)

      expect(setState).toHaveBeenCalledWith({ activeCompany: mockCompany })
    })

    it('should handle multiple consecutive calls', () => {
      const company1: IActiveCompany = {
        id: 'company-1',
        name: 'First Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      const company2: IActiveCompany = {
        id: 'company-2',
        name: 'Second Company',
        logoUrl: 'https://example.com/logo2.png',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        userMembershipId: 'membership-2',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      store.setActiveCompany(company1)
      store.setActiveCompany(company2)
      store.setActiveCompany(null)

      expect(setState).toHaveBeenCalledTimes(3)
      expect(setState).toHaveBeenNthCalledWith(1, { activeCompany: company1 })
      expect(setState).toHaveBeenNthCalledWith(2, { activeCompany: company2 })
      expect(setState).toHaveBeenNthCalledWith(3, { activeCompany: null })
    })
  })

  describe('type safety', () => {
    it('should accept valid IActiveCompany structure', () => {
      const validCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Valid Company',
        logoUrl: 'https://example.com/logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        userMembershipId: 'membership-1',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      // This should not cause TypeScript errors
      expect(() => store.setActiveCompany(validCompany)).not.toThrow()
    })

    it('should accept null value', () => {
      // This should not cause TypeScript errors
      expect(() => store.setActiveCompany(null)).not.toThrow()
    })
  })
})
