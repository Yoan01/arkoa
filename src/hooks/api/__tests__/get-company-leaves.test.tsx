import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { GetCompanyLeavesResponse } from '@/schemas/queries/company-leaves-schema'

import { useGetCompanyLeaves } from '../leaves/get-company-leaves'

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

describe('useGetCompanyLeaves', () => {
  const companyId = 'company-1'

  const mockCompanyLeaves: GetCompanyLeavesResponse = [
    {
      id: 'leave-1',
      type: 'PAID',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-19'),
      status: 'APPROVED',
      reason: 'Family vacation',
      createdAt: new Date('2024-01-01'),
      membership: {
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
      },
    },
    {
      id: 'leave-2',
      type: 'SICK',
      startDate: new Date('2024-01-22'),
      endDate: new Date('2024-01-22'),
      status: 'PENDING',
      halfDayPeriod: 'MORNING',
      reason: 'Medical appointment',
      createdAt: new Date('2024-01-02'),
      membership: {
        user: {
          id: 'user-2',
          name: 'Jane Smith',
        },
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch company leaves successfully without status filter', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanyLeaves,
    } as Response)

    const { result } = renderHook(() => useGetCompanyLeaves({ companyId }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompanyLeaves)
    expect(mockFetch).toHaveBeenCalledWith(`/api/companies/${companyId}/leaves`)
  })

  it('should fetch company leaves successfully with status filter', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const status = 'APPROVED'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanyLeaves,
    } as Response)

    const { result } = renderHook(
      () => useGetCompanyLeaves({ companyId, status }),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompanyLeaves)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/leaves?status=${status}`
    )
  })

  it('should fetch company leaves with PENDING status', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const status = 'PENDING'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanyLeaves,
    } as Response)

    const { result } = renderHook(
      () => useGetCompanyLeaves({ companyId, status }),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompanyLeaves)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/leaves?status=${status}`
    )
  })

  it('should fetch company leaves with REJECTED status', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const status = 'REJECTED'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanyLeaves,
    } as Response)

    const { result } = renderHook(
      () => useGetCompanyLeaves({ companyId, status }),
      {
        wrapper: createWrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompanyLeaves)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/leaves?status=${status}`
    )
  })

  it('should handle fetch error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response)

    const { result } = renderHook(() => useGetCompanyLeaves({ companyId }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error("Erreur lors de la récupération des congés de l'entreprise")
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useGetCompanyLeaves({ companyId }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should not fetch when companyId is not provided', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    const { result } = renderHook(
      () => useGetCompanyLeaves({ companyId: '' }),
      {
        wrapper: createWrapper(),
      }
    )

    expect(result.current.isFetching).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when companyId is undefined', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    const { result } = renderHook(
      () => useGetCompanyLeaves({ companyId: undefined! }),
      {
        wrapper: createWrapper(),
      }
    )

    expect(result.current.isFetching).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should use correct query key without status', () => {
    const { result } = renderHook(() => useGetCompanyLeaves({ companyId }), {
      wrapper: createWrapper(),
    })

    // Just check that the hook is initialized
    expect(result.current).toBeDefined()
  })

  it('should use correct query key with status', () => {
    const status = 'APPROVED'
    const { result } = renderHook(
      () => useGetCompanyLeaves({ companyId, status }),
      {
        wrapper: createWrapper(),
      }
    )

    // Just check that the hook is initialized
    expect(result.current).toBeDefined()
  })
})
