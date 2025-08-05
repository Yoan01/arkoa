import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { useDeleteCompany } from '../companies/delete-company'

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

describe('useDeleteCompany', () => {
  const companyId = 'company-1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete company successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useDeleteCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ companyId })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(`/api/companies/${companyId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  })

  it('should handle deletion error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Cannot delete company with active employees'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useDeleteCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ companyId })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle deletion error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useDeleteCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ companyId })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      new Error('Erreur lors de la suppression')
    )
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useDeleteCompany(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ companyId })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should invalidate companies query on success', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
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

    const { result } = renderHook(() => useDeleteCompany(), { wrapper })

    result.current.mutate({ companyId })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['companies'],
    })
  })
})
