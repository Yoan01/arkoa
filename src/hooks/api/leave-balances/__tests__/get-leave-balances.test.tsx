import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { LeaveBalance } from '@/generated/prisma'

import { useGetLeaveBalances } from '../get-leave-balances'

// Mock fetch
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useGetLeaveBalances', () => {
  const companyId = 'company-1'
  const membershipId = 'membership-1'

  const mockLeaveBalances: LeaveBalance[] = [
    {
      id: 'balance-1',
      membershipId: 'membership-1',
      type: 'PAID',
      remainingDays: 25,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'balance-2',
      membershipId: 'membership-1',
      type: 'SICK',
      remainingDays: 10,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('successful API calls', () => {
    it('should fetch leave balances successfully', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveBalances,
      } as Response)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockLeaveBalances)
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/companies/${companyId}/memberships/${membershipId}/leave-balances`,
        {
          credentials: 'include',
        }
      )
    })

    it('should return empty array when no leave balances exist', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should handle API error with error message', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      const errorMessage = 'Accès refusé'
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      } as Response)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(new Error(errorMessage))
    })

    it('should handle API error without error message', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(
        new Error('Erreur lors de la récupération des soldes de congés')
      )
    })

    it('should handle network error', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      const networkError = new Error('Network error')
      mockFetch.mockRejectedValueOnce(networkError)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(networkError)
    })

    it('should handle JSON parsing error', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as any)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(new Error('Invalid JSON'))
    })
  })

  describe('enabled logic', () => {
    it('should not fetch when companyId is empty', () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>

      const { result } = renderHook(
        () => useGetLeaveBalances('', membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when membershipId is empty', () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>

      const { result } = renderHook(() => useGetLeaveBalances(companyId, ''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when both companyId and membershipId are empty', () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>

      const { result } = renderHook(() => useGetLeaveBalances('', ''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when companyId is undefined', () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>

      const { result } = renderHook(
        () => useGetLeaveBalances(undefined as any, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not fetch when membershipId is undefined', () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, undefined as any),
        {
          wrapper: createWrapper(),
        }
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('React Query configuration', () => {
    it('should use correct query key', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveBalances,
      } as Response)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper,
        }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify the query key is correctly set
      const queryData = queryClient.getQueryData([
        'leave-balances',
        companyId,
        membershipId,
      ])
      expect(queryData).toEqual(mockLeaveBalances)
    })

    it('should include credentials in the request', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveBalances,
      } as Response)

      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/companies/${companyId}/memberships/${membershipId}/leave-balances`,
        {
          credentials: 'include',
        }
      )
    })

    it('should construct correct API endpoint URL', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaveBalances,
      } as Response)

      const customCompanyId = 'custom-company-123'
      const customMembershipId = 'custom-membership-456'

      const { result } = renderHook(
        () => useGetLeaveBalances(customCompanyId, customMembershipId),
        {
          wrapper: createWrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/companies/${customCompanyId}/memberships/${customMembershipId}/leave-balances`,
        {
          credentials: 'include',
        }
      )
    })
  })

  describe('hook behavior', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(
        () => useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
        }
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isError).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeNull()
    })

    it('should handle parameter changes correctly', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockLeaveBalances,
      } as Response)

      const { result, rerender } = renderHook(
        ({ companyId, membershipId }) =>
          useGetLeaveBalances(companyId, membershipId),
        {
          wrapper: createWrapper(),
          initialProps: { companyId, membershipId },
        }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Change parameters
      const newCompanyId = 'company-2'
      const newMembershipId = 'membership-2'
      rerender({ companyId: newCompanyId, membershipId: newMembershipId })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })

      expect(mockFetch).toHaveBeenLastCalledWith(
        `/api/companies/${newCompanyId}/memberships/${newMembershipId}/leave-balances`,
        {
          credentials: 'include',
        }
      )
    })
  })
})
