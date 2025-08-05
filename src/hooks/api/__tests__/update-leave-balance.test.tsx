import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { UpdateLeaveBalanceInput } from '@/schemas/update-leave-balance-schema'

import { useUpdateLeaveBalance } from '../leave-balances/update-leave-balance'

// Mock fetch
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useUpdateLeaveBalance', () => {
  const companyId = 'company-1'
  const membershipId = 'membership-1'
  const mockUpdateData: UpdateLeaveBalanceInput = {
    type: 'PAID',
    change: 5,
    reason: 'Adjustment for overtime work',
  }

  const mockUpdatedBalance = {
    id: 'balance-1',
    membershipId,
    leaveTypeId: 'leave-type-1',
    balance: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update leave balance successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedBalance,
    } as Response)

    const { result } = renderHook(() => useUpdateLeaveBalance(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockUpdatedBalance)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leave-balances`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(mockUpdateData),
      }
    )
  })

  it('should handle update error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Insufficient leave balance'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useUpdateLeaveBalance(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle update error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useUpdateLeaveBalance(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error('Erreur lors de la modification du solde de congés')
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useUpdateLeaveBalance(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should invalidate related queries on success', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedBalance,
    } as Response)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateLeaveBalance(), { wrapper })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should invalidate leave-balances, memberships, and company-stats queries
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['leave-balances', companyId, membershipId],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['memberships', companyId],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['company-stats', companyId],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3)
  })

  it('should handle different balance change types', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const negativeChangeData: UpdateLeaveBalanceInput = {
      type: 'PAID',
      change: -3,
      reason: 'Sick leave deduction',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUpdatedBalance, balance: 22 }),
    } as Response)

    const { result } = renderHook(() => useUpdateLeaveBalance(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: negativeChangeData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leave-balances`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(negativeChangeData),
      }
    )
  })
})
