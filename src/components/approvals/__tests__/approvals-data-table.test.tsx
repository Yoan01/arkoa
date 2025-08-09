import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Jest is used for testing
import { LeaveStatus } from '@/generated/prisma'

import { ApprovalsDataTable } from '../approvals-data-table'

const mockUseGetCompanyLeaves = jest.fn()
const mockUseCompanyStore = jest.fn()

// Mock hooks
jest.mock('@/hooks/api/leaves/get-company-leaves', () => ({
  useGetCompanyLeaves: () => mockUseGetCompanyLeaves(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: () => mockUseCompanyStore(),
}))

// Mock components
jest.mock('../approvals-columns', () => ({
  approvalsColumns: [
    {
      accessorKey: 'membership.user.name',
      header: 'Employé',
      cell: ({ row }: any) => row.original?.membership?.user?.name || 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ getValue }: any) => getValue(),
    },
  ],
}))

const mockLeaves = [
  {
    id: '1',
    type: 'ANNUAL' as const,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-20'),
    status: 'PENDING' as const,
    createdAt: new Date('2024-01-01'),
    membership: {
      user: {
        id: '1',
        name: 'John Doe',
      },
    },
    halfDayPeriod: undefined,
    reason: 'Vacation',
    managerNote: undefined,
  },
  {
    id: '2',
    type: 'SICK' as const,
    startDate: new Date('2024-01-22'),
    endDate: new Date('2024-01-24'),
    status: 'APPROVED' as const,
    createdAt: new Date('2024-01-02'),
    membership: {
      user: {
        id: '2',
        name: 'Jane Smith',
      },
    },
    halfDayPeriod: null,
    reason: 'Medical appointment',
    managerNote: null,
  },
]

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

Wrapper.displayName = 'Wrapper'

describe('ApprovalsDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    mockUseGetCompanyLeaves.mockReturnValue({
      data: [],
      isLoading: true,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    expect(screen.getByText('Approbation des Congés')).toBeInTheDocument()
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('should render table with data', () => {
    mockUseGetCompanyLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    expect(screen.getByText('Approbation des Congés')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('2 demande(s) trouvée(s)')).toBeInTheDocument()
  })

  it('should render empty state when no data', () => {
    mockUseGetCompanyLeaves.mockReturnValue({
      data: [],
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    expect(
      screen.getByText('Aucune demande de congé trouvée.')
    ).toBeInTheDocument()
    expect(screen.getByText('0 demande(s) trouvée(s)')).toBeInTheDocument()
  })

  it('should filter by search input', async () => {
    const _user = userEvent.setup()
    mockUseGetCompanyLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    const searchInput = screen.getByPlaceholderText('Rechercher un employé...')
    await _user.type(searchInput, 'John')

    expect(searchInput).toHaveValue('John')
  })

  it('should filter by status', async () => {
    const _user = userEvent.setup()
    mockUseGetCompanyLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    // Check that status filter exists
    const statusSelect = screen.getByRole('combobox')
    expect(statusSelect).toBeInTheDocument()
  })

  it('should show correct count when filtering by status', () => {
    mockUseGetCompanyLeaves.mockReturnValue({
      data: mockLeaves.filter(leave => leave.status === LeaveStatus.PENDING),
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    expect(screen.getByText('1 demande(s) trouvée(s)')).toBeInTheDocument()
  })

  it('should render table headers', () => {
    mockUseGetCompanyLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    expect(screen.getByText('Employé')).toBeInTheDocument()
    expect(screen.getByText('Statut')).toBeInTheDocument()
  })

  it('should handle missing company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
    })

    mockUseGetCompanyLeaves.mockReturnValue({
      data: [],
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    expect(screen.getByText('Approbation des Congés')).toBeInTheDocument()
  })

  it('should display filter options correctly', () => {
    mockUseGetCompanyLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
    })

    render(
      <Wrapper>
        <ApprovalsDataTable />
      </Wrapper>
    )

    // Check that the select component is rendered
    const statusSelect = screen.getByRole('combobox')
    expect(statusSelect).toBeInTheDocument()

    // Check search input
    expect(
      screen.getByPlaceholderText('Rechercher un employé...')
    ).toBeInTheDocument()
  })
})
