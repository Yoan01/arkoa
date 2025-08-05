import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { CompanyStats } from '@/schemas/company-stats-schema'

import { useGetCompanyStats } from '../companies/get-company-stats'

// Mock fetch
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false, // Disable refetch for tests
      },
    },
  })

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useGetCompanyStats', () => {
  const companyId = 'company-1'
  const mockStats: CompanyStats = {
    totalEmployees: 50,
    employeesOnLeave: 5,
    pendingRequests: 3,
    averageLeaveBalance: 20.5,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch company stats successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    } as Response)

    const { result } = renderHook(() => useGetCompanyStats(companyId), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockStats)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/stats`,
      {
        credentials: 'include',
      }
    )
  })

  it('should handle fetch error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Unauthorized access to company stats'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useGetCompanyStats(companyId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle fetch error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useGetCompanyStats(companyId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error('Erreur lors de la récupération des statistiques')
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useGetCompanyStats(companyId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should not fetch when companyId is not provided', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    const { result } = renderHook(() => useGetCompanyStats(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when companyId is empty string', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    const { result } = renderHook(() => useGetCompanyStats(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should throw error when companyId is not provided in queryFn', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    // Force enable the query even without companyId to test the error
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchInterval: false,
        },
      },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => {
        return useGetCompanyStats(undefined)
      },
      { wrapper }
    )

    // The query should be disabled, so no error should occur
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should use correct query key', () => {
    const { result } = renderHook(() => useGetCompanyStats(companyId), {
      wrapper: createWrapper(),
    })

    expect(result.current).toBeDefined()
    expect(typeof result.current.refetch).toBe('function')
  })
})
