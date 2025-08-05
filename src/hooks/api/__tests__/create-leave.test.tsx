import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { CreateLeaveInput } from '@/schemas/create-leave-schema'

import { useCreateLeave } from '../leaves/create-leave'

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

describe('useCreateLeave', () => {
  const companyId = 'company-1'
  const membershipId = 'membership-1'
  const mockLeaveData: CreateLeaveInput = {
    type: 'PAID',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-19'),
    reason: 'Family vacation',
  }

  const mockCreatedLeave = {
    id: 'leave-1',
    membershipId,
    leaveTypeId: 'leave-type-1',
    startDate: '2024-01-15',
    endDate: '2024-01-19',
    reason: 'Family vacation',
    status: 'PENDING',
    isHalfDay: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create leave successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedLeave,
    } as Response)

    const { result } = renderHook(() => useCreateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockLeaveData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCreatedLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leaves`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(mockLeaveData),
      }
    )
  })

  it('should handle creation error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Insufficient leave balance'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useCreateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockLeaveData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle creation error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useCreateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockLeaveData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error('Erreur lors de la création du congé')
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCreateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockLeaveData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should invalidate leaves query on success', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedLeave,
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

    const { result } = renderHook(() => useCreateLeave(), { wrapper })

    result.current.mutate({
      data: mockLeaveData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['leaves', companyId, membershipId],
    })
  })

  it('should handle half-day leave creation', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const halfDayLeaveData: CreateLeaveInput = {
      ...mockLeaveData,
      halfDayPeriod: 'MORNING',
    }

    const mockHalfDayLeave = {
      ...mockCreatedLeave,
      isHalfDay: true,
      halfDayPeriod: 'MORNING',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHalfDayLeave,
    } as Response)

    const { result } = renderHook(() => useCreateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: halfDayLeaveData,
      companyId,
      membershipId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockHalfDayLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leaves`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(halfDayLeaveData),
      }
    )
  })
})
