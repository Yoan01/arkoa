import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useGetMemberships } from '@/hooks/api/memberships/get-memberships'
import { useCompanyStore } from '@/stores/use-company-store'

import { ActifMembershipCard } from '../actif-membership-card'

// Mock des hooks
jest.mock('@/hooks/api/memberships/get-memberships')
jest.mock('@/stores/use-company-store')

const mockUseGetMemberships = useGetMemberships as jest.Mock
const mockUseCompanyStore = jest.mocked(useCompanyStore)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('ActifMembershipCard', () => {
  beforeEach(() => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
      setActiveCompany: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseGetMemberships.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<ActifMembershipCard />, { wrapper: createWrapper() })

    expect(screen.getByText('Employés actifs')).toBeInTheDocument()
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(2)
  })

  it('renders error state correctly', () => {
    mockUseGetMemberships.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    })

    render(<ActifMembershipCard />, { wrapper: createWrapper() })

    expect(screen.getByText('Employés actifs')).toBeInTheDocument()
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(2)
  })

  it('renders success state with membership data', () => {
    const mockMemberships = [
      { id: '1', onLeave: false, user: { name: 'John Doe' } },
      { id: '2', onLeave: true, user: { name: 'Jane Smith' } },
      { id: '3', onLeave: false, user: { name: 'Bob Johnson' } },
      { id: '4', onLeave: false, user: { name: 'Alice Brown' } },
    ]

    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ActifMembershipCard />, { wrapper: createWrapper() })

    expect(screen.getByText('Employés actifs')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // Present employees
    expect(screen.getByText('1')).toBeInTheDocument() // On leave employees
    expect(screen.getByText('Présent')).toBeInTheDocument()
    expect(screen.getByText('En congé')).toBeInTheDocument()
    expect(screen.getByText("75% de l'équipe présente")).toBeInTheDocument()
  })

  it('handles empty membership data', () => {
    mockUseGetMemberships.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ActifMembershipCard />, { wrapper: createWrapper() })

    expect(screen.getByText('Employés actifs')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(2) // Present and on leave employees
    expect(screen.getByText("0% de l'équipe présente")).toBeInTheDocument()
  })

  it('handles all employees on leave', () => {
    const mockMemberships = [
      { id: '1', onLeave: true, user: { name: 'John Doe' } },
      { id: '2', onLeave: true, user: { name: 'Jane Smith' } },
    ]

    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ActifMembershipCard />, { wrapper: createWrapper() })

    expect(screen.getByText('0')).toBeInTheDocument() // Present employees (should be unique)
    expect(screen.getByText('2')).toBeInTheDocument() // On leave employees
    expect(screen.getByText("0% de l'équipe présente")).toBeInTheDocument()
  })

  it('handles no active company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    mockUseGetMemberships.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ActifMembershipCard />, { wrapper: createWrapper() })

    expect(mockUseGetMemberships).toHaveBeenCalledWith('')
  })
})
