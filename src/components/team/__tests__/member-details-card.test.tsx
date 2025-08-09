import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { useGetMembership } from '@/hooks/api/memberships/get-membership'
import { useCompanyStore } from '@/stores/use-company-store'

import { MemberDetailsCard } from '../member-details-card'

// Mock de next/navigation
const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock('@/hooks/api/memberships/get-membership')
jest.mock('@/stores/use-company-store')

const mockUseGetMembership = useGetMembership as jest.Mock
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

describe('MemberDetailsCard', () => {
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
    mockUseGetMembership.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Détails du Salarié')).toBeInTheDocument()
    // Vérifier la présence des skeletons
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error state correctly', () => {
    mockUseGetMembership.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Détails du Salarié')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('renders error state with default message when no error message', () => {
    mockUseGetMembership.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText('Impossible de charger les détails du membre')
    ).toBeInTheDocument()
  })

  it('renders member details correctly for employee role', () => {
    const mockMembership = {
      id: 'membership-1',
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      company: {
        id: 'company-1',
        name: 'Test Company',
      },
      role: 'EMPLOYEE',
      createdAt: new Date('2023-01-15'),
    }

    mockUseGetMembership.mockReturnValue({
      data: mockMembership,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('Employé')).toBeInTheDocument()
    expect(screen.getByText('Test Company')).toBeInTheDocument()
    expect(screen.getByText('15 janvier 2023')).toBeInTheDocument()
  })

  it('renders member details correctly for manager role', () => {
    const mockMembership = {
      id: 'membership-1',
      user: {
        id: 'user-1',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        image: null,
      },
      company: {
        id: 'company-1',
        name: 'Test Company',
      },
      role: 'MANAGER',
      createdAt: new Date('2022-06-10'),
    }

    mockUseGetMembership.mockReturnValue({
      data: mockMembership,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()
    expect(screen.getByText('10 juin 2022')).toBeInTheDocument()
    // Vérifier que les initiales sont affichées quand pas d'image
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('handles back button click', () => {
    const mockMembership = {
      id: 'membership-1',
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: null,
      },
      company: {
        id: 'company-1',
        name: 'Test Company',
      },
      role: 'EMPLOYEE',
      createdAt: new Date('2023-01-15'),
    }

    mockUseGetMembership.mockReturnValue({
      data: mockMembership,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    const backButton = screen.getByRole('button')
    fireEvent.click(backButton)

    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  it('handles no active company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    mockUseGetMembership.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberDetailsCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(mockUseGetMembership).toHaveBeenCalledWith('', 'membership-1')
  })
})
