import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { UserCompanyInput } from '@/schemas/queries/user-company-schema'
import { UpdateCompanyInput } from '@/schemas/update-company-schema'

import { useUpdateCompany } from '../companies/update-company'

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

describe('useUpdateCompany', () => {
  const mockUpdateData: UpdateCompanyInput = {
    id: 'company-1',
    name: 'Updated Company Name',
    logoUrl: 'https://example.com/new-logo.png',
    annualLeaveDays: 30,
  }

  const mockUpdatedCompany: UserCompanyInput = {
    id: 'company-1',
    name: 'Updated Company Name',
    logoUrl: 'https://example.com/new-logo.png',
    annualLeaveDays: 30,
    userMembershipId: 'membership-1',
    userRole: 'MANAGER',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update company successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedCompany,
    } as Response)

    const { result } = renderHook(() => useUpdateCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockUpdateData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockUpdatedCompany)
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${mockUpdateData.id}`,
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
    const errorMessage = 'Company name already exists'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useUpdateCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockUpdateData)

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

    const { result } = renderHook(() => useUpdateCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockUpdateData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Erreur serveur'))
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useUpdateCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(mockUpdateData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should invalidate companies and active-company queries on success', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedCompany,
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

    const { result } = renderHook(() => useUpdateCompany(), { wrapper })

    result.current.mutate(mockUpdateData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should invalidate both companies and active-company queries
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['companies'],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['active-company'],
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2)
  })

  it('should handle partial update data', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const partialUpdateData: UpdateCompanyInput = {
      id: 'company-1',
      name: 'New Name Only',
      annualLeaveDays: 25,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockUpdatedCompany, name: 'New Name Only' }),
    } as Response)

    const { result } = renderHook(() => useUpdateCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(partialUpdateData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/companies/${partialUpdateData.id}`,
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
})
