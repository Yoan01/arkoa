import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { UpdateLeaveInput } from '@/schemas/update-leave-schema'

import { useUpdateLeave } from '../leaves/update-leave'

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

describe('useUpdateLeave', () => {
  const companyId = 'company-1'
  const membershipId = 'membership-1'
  const leaveId = 'leave-1'

  const mockUpdateData: UpdateLeaveInput = {
    type: 'PAID',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-24'),
    reason: 'Updated vacation dates',
  }

  const mockUpdatedLeave = {
    id: leaveId,
    membershipId,
    leaveTypeId: 'leave-type-2',
    startDate: '2024-01-20',
    endDate: '2024-01-24',
    reason: 'Updated vacation dates',
    status: 'PENDING',
    isHalfDay: false,
    halfDayPeriod: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update leave successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedLeave,
    } as Response)

    const { result } = renderHook(() => useUpdateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
      leaveId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockUpdatedLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leaves/${leaveId}`,
      {
        method: 'PATCH',
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
    const errorMessage = 'Cannot update approved leave'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useUpdateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
      leaveId,
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

    const { result } = renderHook(() => useUpdateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
      leaveId,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error('Erreur lors de la modification du congé')
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useUpdateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
      leaveId,
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
      json: async () => mockUpdatedLeave,
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

    const { result } = renderHook(() => useUpdateLeave(), { wrapper })

    result.current.mutate({
      data: mockUpdateData,
      companyId,
      membershipId,
      leaveId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['leaves', companyId, membershipId],
    })
  })

  it('should handle partial update data', async () => {
    const partialUpdateData = {
      reason: 'Updated reason only',
    }

    const partiallyUpdatedLeave = {
      ...mockUpdatedLeave,
      reason: 'Updated reason only',
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => partiallyUpdatedLeave,
    } as Response)

    const { result } = renderHook(() => useUpdateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: partialUpdateData,
      companyId,
      membershipId,
      leaveId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(partiallyUpdatedLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leaves/${leaveId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(partialUpdateData),
      }
    )
  })

  it('should handle half-day leave update', async () => {
    const halfDayUpdateData: UpdateLeaveInput = {
      type: 'SICK',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-15'),
      reason: 'Medical appointment',
      halfDayPeriod: 'MORNING',
    }

    const halfDayUpdatedLeave = {
      ...mockUpdatedLeave,
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      reason: 'Medical appointment',
      isHalfDay: true,
      halfDayPeriod: 'MORNING',
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => halfDayUpdatedLeave,
    } as Response)

    const { result } = renderHook(() => useUpdateLeave(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      data: halfDayUpdateData,
      companyId,
      membershipId,
      leaveId,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(halfDayUpdatedLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships/${membershipId}/leaves/${leaveId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(halfDayUpdateData),
      }
    )
  })
})
