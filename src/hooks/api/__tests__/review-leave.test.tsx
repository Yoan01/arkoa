import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { LeaveStatus } from '@/generated/prisma'
import { ReviewLeaveParams } from '@/schemas/queries/review-leave-schema'

import { useReviewLeave } from '../leaves/review-leave'

// Mock fetch
global.fetch = jest.fn()

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

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

describe('useReviewLeave', () => {
  const companyId = 'company-1'
  const leaveId = 'leave-1'
  const managerNote = 'Approved for vacation'

  const mockReviewedLeave = {
    id: leaveId,
    membershipId: 'membership-1',
    leaveTypeId: 'leave-type-1',
    startDate: '2024-01-15',
    endDate: '2024-01-19',
    status: 'APPROVED',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'manager-1',
    reviewComment: managerNote,
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should approve leave successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReviewedLeave,
    } as Response)

    const { result } = renderHook(() => useReviewLeave(), {
      wrapper: createWrapper(),
    })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.APPROVED,
      managerNote,
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockReviewedLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/leaves/${leaveId}/review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: LeaveStatus.APPROVED,
          managerNote,
        }),
      }
    )
  })

  it('should reject leave successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const rejectedLeave = {
      ...mockReviewedLeave,
      status: 'REJECTED',
      reviewComment: 'Insufficient leave balance',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => rejectedLeave,
    } as Response)

    const { result } = renderHook(() => useReviewLeave(), {
      wrapper: createWrapper(),
    })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.REJECTED,
      managerNote: 'Insufficient leave balance',
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(rejectedLeave)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/leaves/${leaveId}/review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: LeaveStatus.REJECTED,
          managerNote: 'Insufficient leave balance',
        }),
      }
    )
  })

  it('should handle review error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Leave already reviewed'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useReviewLeave(), {
      wrapper: createWrapper(),
    })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.APPROVED,
      managerNote,
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle review error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useReviewLeave(), {
      wrapper: createWrapper(),
    })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.APPROVED,
      managerNote,
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error('Erreur lors de la révision de la demande')
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useReviewLeave(), {
      wrapper: createWrapper(),
    })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.APPROVED,
      managerNote,
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should invalidate queries on success', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReviewedLeave,
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

    const { result } = renderHook(() => useReviewLeave(), { wrapper })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.APPROVED,
      managerNote,
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['company-leaves', companyId],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['leave-stats', companyId],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['leaves'],
    })
  })

  it('should handle review without manager note', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const reviewWithoutNote = {
      ...mockReviewedLeave,
      reviewComment: null,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => reviewWithoutNote,
    } as Response)

    const { result } = renderHook(() => useReviewLeave(), {
      wrapper: createWrapper(),
    })

    const reviewParams: ReviewLeaveParams = {
      companyId,
      leaveId,
      action: LeaveStatus.APPROVED,
    }

    result.current.mutate(reviewParams)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(reviewWithoutNote)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/leaves/${leaveId}/review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: LeaveStatus.APPROVED,
          managerNote: undefined,
        }),
      }
    )
  })
})
