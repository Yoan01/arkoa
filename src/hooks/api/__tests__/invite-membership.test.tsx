import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { InviteMemberInput } from '@/schemas/invite-member-schema'

import { useInviteMembership } from '../memberships/invite-membership'

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

describe('useInviteMembership', () => {
  const companyId = 'company-1'

  const mockInviteData: InviteMemberInput = {
    email: 'newmember@example.com',
    role: 'EMPLOYEE',
  }

  const mockInvitedMembership = {
    id: 'membership-new',
    userId: 'user-new',
    companyId,
    role: 'EMPLOYEE',
    status: 'PENDING',
    joinedAt: null,
    leftAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 'user-new',
      email: 'newmember@example.com',
      firstName: 'New',
      lastName: 'Member',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should invite membership successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvitedMembership,
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: mockInviteData,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockInvitedMembership)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(mockInviteData),
      }
    )
  })

  it('should handle invitation error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'User already exists in company'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: mockInviteData,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle invitation error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: mockInviteData,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error("Erreur lors de l'invitation")
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: mockInviteData,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should invalidate company members query on success', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvitedMembership,
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

    const { result } = renderHook(() => useInviteMembership(), { wrapper })

    result.current.mutate({
      companyId,
      data: mockInviteData,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['company', companyId, 'members'],
    })
  })

  it('should handle manager role invitation', async () => {
    const managerInviteData: InviteMemberInput = {
      ...mockInviteData,
      role: 'MANAGER',
    }

    const managerInvitedMembership = {
      ...mockInvitedMembership,
      role: 'MANAGER',
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => managerInvitedMembership,
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: managerInviteData,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(managerInvitedMembership)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(managerInviteData),
      }
    )
  })

  it('should handle admin role invitation', async () => {
    const adminInviteData: InviteMemberInput = {
      ...mockInviteData,
      role: 'MANAGER',
    }

    const adminInvitedMembership = {
      ...mockInvitedMembership,
      role: 'MANAGER',
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => adminInvitedMembership,
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: adminInviteData,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(adminInvitedMembership)
    expect(result.current.data?.role).toBe('MANAGER')
  })

  it('should handle invitation with minimal data', async () => {
    const minimalInviteData: InviteMemberInput = {
      email: 'minimal@example.com',
      role: 'EMPLOYEE',
    }

    const minimalInvitedMembership = {
      ...mockInvitedMembership,
      user: {
        ...mockInvitedMembership.user,
        email: 'minimal@example.com',
        firstName: null,
        lastName: null,
      },
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => minimalInvitedMembership,
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: minimalInviteData,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(minimalInvitedMembership)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${companyId}/memberships`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(minimalInviteData),
      }
    )
  })

  it('should handle duplicate email error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const duplicateEmailError = 'Email already exists'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: duplicateEmailError }),
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: mockInviteData,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(duplicateEmailError))
  })

  it('should handle invalid email format error', async () => {
    const invalidEmailData: InviteMemberInput = {
      ...mockInviteData,
      email: 'invalid-email',
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const invalidEmailError = 'Invalid email format'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: invalidEmailError }),
    } as Response)

    const { result } = renderHook(() => useInviteMembership(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      companyId,
      data: invalidEmailData,
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(invalidEmailError))
  })
})
