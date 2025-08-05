/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react'

import { UserRole } from '@/generated/prisma'

import type { IActiveCompany } from '../slices/active-company-slice'
import { useCompanyStore } from '../use-company-store'

// Mock the storage dependencies
jest.mock('../storages/db-storage', () => ({
  dbPromise: Promise.resolve({
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }),
}))

// Mock zustand persist to avoid actual storage operations during tests
jest.mock('zustand/middleware', () => ({
  persist: (config: unknown) => config,
}))

describe('useCompanyStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useCompanyStore.setState({ activeCompany: null })
  })

  describe('initial state', () => {
    it('should have initial state with activeCompany as null', () => {
      const { result } = renderHook(() => useCompanyStore())

      expect(result.current.activeCompany).toBeNull()
      expect(typeof result.current.setActiveCompany).toBe('function')
    })
  })

  describe('setActiveCompany', () => {
    it('should set active company correctly', () => {
      const { result } = renderHook(() => useCompanyStore())

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

      act(() => {
        result.current.setActiveCompany(mockCompany)
      })

      expect(result.current.activeCompany).toEqual(mockCompany)
    })

    it('should clear active company when set to null', () => {
      const { result } = renderHook(() => useCompanyStore())

      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      // First set a company
      act(() => {
        result.current.setActiveCompany(mockCompany)
      })
      expect(result.current.activeCompany).toEqual(mockCompany)

      // Then clear it
      act(() => {
        result.current.setActiveCompany(null)
      })
      expect(result.current.activeCompany).toBeNull()
    })

    it('should handle different user roles', () => {
      const { result } = renderHook(() => useCompanyStore())

      const roles = [UserRole.MANAGER, UserRole.EMPLOYEE]

      roles.forEach((role, index) => {
        const mockCompany: IActiveCompany = {
          id: `company-${index + 1}`,
          name: `${role} Company`,
          logoUrl: `https://example.com/logo${index + 1}.png`,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          userMembershipId: `membership-${index + 1}`,
          userRole: role,
          annualLeaveDays: 25,
        }

        act(() => {
          result.current.setActiveCompany(mockCompany)
        })

        expect(result.current.activeCompany).toEqual(mockCompany)
        expect(result.current.activeCompany?.userRole).toBe(role)
      })
    })

    it('should handle company without logo', () => {
      const { result } = renderHook(() => useCompanyStore())

      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Company Without Logo',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      act(() => {
        result.current.setActiveCompany(mockCompany)
      })

      expect(result.current.activeCompany).toEqual(mockCompany)
      expect(result.current.activeCompany?.logoUrl).toBeNull()
    })
  })

  describe('state persistence', () => {
    it('should maintain state across multiple hook instances', () => {
      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Persistent Company',
        logoUrl: 'https://example.com/logo.png',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      // First hook instance
      const { result: result1 } = renderHook(() => useCompanyStore())

      act(() => {
        result1.current.setActiveCompany(mockCompany)
      })

      // Second hook instance should have the same state
      const { result: result2 } = renderHook(() => useCompanyStore())

      expect(result2.current.activeCompany).toEqual(mockCompany)
    })

    it('should update all hook instances when state changes', () => {
      const mockCompany1: IActiveCompany = {
        id: 'company-1',
        name: 'First Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      const mockCompany2: IActiveCompany = {
        id: 'company-2',
        name: 'Second Company',
        logoUrl: 'https://example.com/logo2.png',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        userMembershipId: 'membership-2',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      const { result: result1 } = renderHook(() => useCompanyStore())
      const { result: result2 } = renderHook(() => useCompanyStore())

      // Set company from first hook
      act(() => {
        result1.current.setActiveCompany(mockCompany1)
      })

      expect(result1.current.activeCompany).toEqual(mockCompany1)
      expect(result2.current.activeCompany).toEqual(mockCompany1)

      // Update from second hook
      act(() => {
        result2.current.setActiveCompany(mockCompany2)
      })

      expect(result1.current.activeCompany).toEqual(mockCompany2)
      expect(result2.current.activeCompany).toEqual(mockCompany2)
    })
  })

  describe('store selectors', () => {
    it('should allow selective state subscription', () => {
      const { result } = renderHook(() =>
        useCompanyStore(state => state.activeCompany?.name)
      )

      expect(result.current).toBeUndefined()

      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Selective Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      act(() => {
        useCompanyStore.getState().setActiveCompany(mockCompany)
      })

      expect(result.current).toBe('Selective Company')
    })

    it('should allow selecting user role', () => {
      const { result } = renderHook(() =>
        useCompanyStore(state => state.activeCompany?.userRole)
      )

      expect(result.current).toBeUndefined()

      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Role Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.MANAGER,
        annualLeaveDays: 25,
      }

      act(() => {
        useCompanyStore.getState().setActiveCompany(mockCompany)
      })

      expect(result.current).toBe(UserRole.MANAGER)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useCompanyStore())

      const companies: IActiveCompany[] = Array.from({ length: 5 }, (_, i) => ({
        id: `company-${i + 1}`,
        name: `Company ${i + 1}`,
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: `membership-${i + 1}`,
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }))

      act(() => {
        companies.forEach(company => {
          result.current.setActiveCompany(company)
        })
      })

      // Should have the last company set
      expect(result.current.activeCompany).toEqual(companies[4])
    })

    it('should handle setting the same company multiple times', () => {
      const { result } = renderHook(() => useCompanyStore())

      const mockCompany: IActiveCompany = {
        id: 'company-1',
        name: 'Same Company',
        logoUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        userMembershipId: 'membership-1',
        userRole: UserRole.EMPLOYEE,
        annualLeaveDays: 25,
      }

      act(() => {
        result.current.setActiveCompany(mockCompany)
        result.current.setActiveCompany(mockCompany)
        result.current.setActiveCompany(mockCompany)
      })

      expect(result.current.activeCompany).toEqual(mockCompany)
    })
  })
})
