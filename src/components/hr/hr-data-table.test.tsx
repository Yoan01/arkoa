import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

// Mock des hooks
import { useGetMemberships } from '@/hooks/api/memberships/get-memberships'
import { useCompanyStore } from '@/stores/use-company-store'

import { HrDataTable } from './hr-data-table'

jest.mock('@/hooks/api/memberships/get-memberships', () => ({
  useGetMemberships: jest.fn(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: jest.fn(),
}))

// Mock des colonnes
jest.mock('./hr-columns', () => ({
  hrColumns: [
    {
      accessorKey: 'user.name',
      header: 'Nom',
      cell: ({ row }: any) => row.original.user.name,
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: ({ row }: any) => row.original.user.email,
    },
  ],
}))

const mockUseGetMemberships = useGetMemberships as jest.MockedFunction<any>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<any>

const mockMemberships = [
  {
    id: 'membership-1',
    role: 'MANAGER',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    leaveBalances: [
      {
        id: 'balance-1',
        type: 'PAID',
        remainingDays: 15.5,
      },
    ],
  },
  {
    id: 'membership-2',
    role: 'EMPLOYEE',
    user: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    leaveBalances: [
      {
        id: 'balance-2',
        type: 'PAID',
        remainingDays: 20.0,
      },
    ],
  },
]

const createMockQueryResult = (
  data: any,
  isLoading = false,
  error: any = null
) => ({
  data,
  isLoading,
  error,
  isError: !!error,
  isPending: isLoading,
  isSuccess: !isLoading && !error,
  isFetching: false,
  isRefetching: false,
  isStale: false,
  refetch: jest.fn(),
  remove: jest.fn(),
  status: error
    ? ('error' as const)
    : isLoading
      ? ('pending' as const)
      : ('success' as const),
  fetchStatus: 'idle' as const,
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isInitialLoading: false,
  isLoadingError: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isRefetchError: false,
  isPaused: false,
  promise: Promise.resolve(data),
})

// Helper pour wrapper avec QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  )
}

describe('HrDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetMemberships.mockReturnValue(
      createMockQueryResult(mockMemberships)
    )
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
    })
  })

  it('devrait afficher le titre du composant', () => {
    mockUseGetMemberships.mockReturnValue(createMockQueryResult([]))

    renderWithQueryClient(<HrDataTable />)

    expect(screen.getByText('Gestion des Congés Employés')).toBeInTheDocument()
  })

  it('devrait afficher un état de chargement', () => {
    mockUseGetMemberships.mockReturnValue(
      createMockQueryResult(undefined, true)
    )

    renderWithQueryClient(<HrDataTable />)

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
    expect(screen.getByText('Gestion des Congés Employés')).toBeInTheDocument()
  })

  it('devrait afficher les données des membres', () => {
    mockUseGetMemberships.mockReturnValue(
      createMockQueryResult(mockMemberships)
    )

    renderWithQueryClient(<HrDataTable />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('devrait afficher les en-têtes de colonnes', () => {
    mockUseGetMemberships.mockReturnValue(
      createMockQueryResult(mockMemberships)
    )

    renderWithQueryClient(<HrDataTable />)

    expect(screen.getByText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it("devrait afficher un message quand il n'y a pas de données", () => {
    mockUseGetMemberships.mockReturnValue(createMockQueryResult([]))

    renderWithQueryClient(<HrDataTable />)

    expect(screen.getByText('Aucun employé trouvé.')).toBeInTheDocument()
  })

  it("devrait appeler useGetMemberships avec l'ID de l'entreprise active", () => {
    mockUseGetMemberships.mockReturnValue(createMockQueryResult([]))

    renderWithQueryClient(<HrDataTable />)

    expect(mockUseGetMemberships).toHaveBeenCalledWith('company-1')
  })

  it("devrait appeler useGetMemberships avec une chaîne vide quand il n'y a pas d'entreprise active", () => {
    mockUseCompanyStore.mockReturnValue({ activeCompany: null })
    mockUseGetMemberships.mockReturnValue(createMockQueryResult([]))

    renderWithQueryClient(<HrDataTable />)

    expect(mockUseGetMemberships).toHaveBeenCalledWith('')
  })

  it('devrait avoir une structure de tableau responsive', () => {
    mockUseGetMemberships.mockReturnValue(
      createMockQueryResult(mockMemberships)
    )

    renderWithQueryClient(<HrDataTable />)

    const table = screen.getByRole('table')
    expect(table).toHaveClass('min-w-[700px]')

    const tableContainer = table.closest('.overflow-x-auto')
    expect(tableContainer).toBeInTheDocument()
  })

  it('devrait afficher le bon nombre de lignes', () => {
    mockUseGetMemberships.mockReturnValue(
      createMockQueryResult(mockMemberships)
    )

    renderWithQueryClient(<HrDataTable />)

    const rows = screen.getAllByRole('row')
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3)
  })

  it('devrait gérer les données par défaut quand data est undefined', () => {
    mockUseGetMemberships.mockReturnValue(createMockQueryResult(undefined))

    renderWithQueryClient(<HrDataTable />)

    expect(screen.getByText('Aucun employé trouvé.')).toBeInTheDocument()
  })
})
