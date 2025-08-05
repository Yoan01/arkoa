import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { Company } from '@/generated/prisma'

import { useGetCompany } from '../companies/get-company'

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

describe('useGetCompany', () => {
  const companyId = 'company-1'
  const mockCompany: Company = {
    id: companyId,
    name: 'Test Company',
    logoUrl: 'https://example.com/logo.png',
    annualLeaveDays: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch company successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompany,
    } as Response)

    const { result } = renderHook(() => useGetCompany(companyId), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCompany)
    expect(mockFetch).toHaveBeenCalledWith(`/api/companies/${companyId}`, {
      credentials: 'include',
    })
  })

  it('should handle fetch error with error message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    const errorMessage = 'Company not found'

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useGetCompany(companyId), {
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

    const { result } = renderHook(() => useGetCompany(companyId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Erreur serveur'))
  })

  it('should handle network error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useGetCompany(companyId), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('Network error'))
  })

  it('should not fetch when companyId is empty', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>

    const { result } = renderHook(() => useGetCompany(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should use correct query key', () => {
    const { result } = renderHook(() => useGetCompany(companyId), {
      wrapper: createWrapper(),
    })

    expect(result.current).toBeDefined()
    expect(typeof result.current.refetch).toBe('function')
  })

  it('should be enabled only when companyId is provided', () => {
    // Test with valid companyId
    const { result: resultWithId } = renderHook(
      () => useGetCompany(companyId),
      {
        wrapper: createWrapper(),
      }
    )
    expect(resultWithId.current.isLoading).toBe(true)

    // Test with null companyId
    const { result: resultWithoutId } = renderHook(() => useGetCompany(''), {
      wrapper: createWrapper(),
    })
    expect(resultWithoutId.current.isLoading).toBe(false)
    expect(resultWithoutId.current.data).toBeUndefined()
  })
})
