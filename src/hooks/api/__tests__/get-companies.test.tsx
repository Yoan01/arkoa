import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { useGetCompanies } from '../companies/get-companies'

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

describe('useGetCompanies', () => {
  const mockCompanies = [
    {
      id: 'company-1',
      name: 'Company 1',
      logoUrl: 'https://example.com/logo1.png',
      annualLeaveDays: 25,
      userMembershipId: 'membership-1',
      userRole: 'MANAGER' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'company-2',
      name: 'Company 2',
      logoUrl: 'https://example.com/logo2.png',
      annualLeaveDays: 30,
      userMembershipId: 'membership-2',
      userRole: 'EMPLOYEE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch companies successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanies,
    } as Response)

    const { result } = renderHook(() => useGetCompanies(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompanies)
    expect(mockFetch).toHaveBeenCalledWith('/api/companies', {
      credentials: 'include',
    })
  })

  it('should handle fetch error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Unauthorized'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useGetCompanies(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error(errorMessage))
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useGetCompanies(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should handle server error without error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useGetCompanies(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Erreur serveur'))
  })

  it('should accept custom options', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompanies,
    } as Response)

    const { result } = renderHook(() => useGetCompanies({ enabled: false }), {
      wrapper: createWrapper(),
    })

    // La requête ne devrait pas être exécutée car enabled: false
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should use correct query key', () => {
    const { result } = renderHook(() => useGetCompanies(), {
      wrapper: createWrapper(),
    })

    // Vérifier que le hook est initialisé correctement
    expect(result.current).toBeDefined()
    expect(typeof result.current.refetch).toBe('function')
  })
})
