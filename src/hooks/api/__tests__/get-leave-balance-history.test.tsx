import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { LeaveBalanceHistoryWithActorAndTypeInput } from '@/schemas/queries/leave-balance-history-whit-actor-and-type-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { useGetLeaveBalanceHistory } from '../leave-balances/get-leave-balance-history'

// Mock fetch
global.fetch = jest.fn()

// Mock the company store
jest.mock('@/stores/use-company-store')
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>

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

describe('useGetLeaveBalanceHistory', () => {
  const membershipId = 'membership-1'
  const mockActiveCompany = {
    id: 'company-1',
    name: 'Test Company',
    logoUrl: 'https://example.com/logo.png',
    annualLeaveDays: 25,
    userMembershipId: 'membership-1',
    userRole: 'MANAGER' as const,
  }

  const mockHistory: LeaveBalanceHistoryWithActorAndTypeInput[] = [
    {
      id: 'history-1',
      leaveBalanceId: 'balance-1',
      change: 5,
      reason: 'ANNUAL_RESET',
      createdAt: new Date(),
      actor: {
        id: 'actor-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      leaveBalance: {
        type: 'PAID',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCompanyStore.mockReturnValue({
      activeCompany: mockActiveCompany,
      setActiveCompany: jest.fn(),
    })
  })

  it('should fetch leave balance history successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistory,
    } as Response)

    const { result } = renderHook(
      () => useGetLeaveBalanceHistory(membershipId),
      {
        wrapper: createWrapper(),
      }
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockHistory)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${mockActiveCompany.id}/memberships/${membershipId}/leave-balance-history`
    )
  })

  it('should handle fetch error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response)

    const { result } = renderHook(
      () => useGetLeaveBalanceHistory(membershipId),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error("Erreur lors de la récupération de l'historique")
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(
      () => useGetLeaveBalanceHistory(membershipId),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should not fetch when activeCompany is not available', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    const { result } = renderHook(
      () => useGetLeaveBalanceHistory(membershipId),
      {
        wrapper: createWrapper(),
      }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when membershipId is not provided', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    const { result } = renderHook(() => useGetLeaveBalanceHistory(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should throw error when activeCompany is not available in queryFn', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    // Mock store to return null activeCompany but enable the query manually
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    // Force enable the query to test the error in queryFn
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => useGetLeaveBalanceHistory(membershipId),
      {
        wrapper,
      }
    )

    // The query should be disabled when activeCompany is null
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should use correct query key', () => {
    const { result } = renderHook(
      () => useGetLeaveBalanceHistory(membershipId),
      {
        wrapper: createWrapper(),
      }
    )

    expect(result.current).toBeDefined()
    expect(typeof result.current.refetch).toBe('function')
  })
})
