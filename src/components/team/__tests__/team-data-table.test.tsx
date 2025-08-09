import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { User } from '@/generated/prisma'
import { useGetMemberships } from '@/hooks/api/memberships/get-memberships'
import { MembershipWithUserAndBalances } from '@/schemas/edit-leave-balance-dialog-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { TeamDataTable } from '../team-data-table'

// Mock des hooks
jest.mock('@/hooks/api/memberships/get-memberships')
jest.mock('@/stores/use-company-store')

const mockUseGetMemberships = useGetMemberships as jest.Mock
const mockUseCompanyStore = jest.mocked(useCompanyStore)

// Mock des composants UI
jest.mock('@/components/ui/table', () => ({
  Table: ({ children, className }: any) => (
    <table data-testid='table' className={className}>
      {children}
    </table>
  ),
  TableBody: ({ children }: any) => (
    <tbody data-testid='table-body'>{children}</tbody>
  ),
  TableCell: ({ children, className, colSpan }: any) => (
    <td data-testid='table-cell' className={className} colSpan={colSpan}>
      {children}
    </td>
  ),
  TableHead: ({ children, className }: any) => (
    <th data-testid='table-head' className={className}>
      {children}
    </th>
  ),
  TableHeader: ({ children }: any) => (
    <thead data-testid='table-header'>{children}</thead>
  ),
  TableRow: ({ children, className, ...props }: any) => (
    <tr data-testid='table-row' className={className} {...props}>
      {children}
    </tr>
  ),
}))

// Mock des colonnes
jest.mock('../team-columns', () => ({
  teamColumns: [
    {
      accessorKey: 'user',
      header: 'Employé',
      cell: ({ getValue }: any) => {
        const user = getValue()
        return <div data-testid='user-cell'>{user.name}</div>
      },
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: ({ row }: any) => {
        const user = row.original.user
        return <div data-testid='email-cell'>{user.email}</div>
      },
    },
    {
      accessorKey: 'onLeave',
      header: 'Statut',
      cell: ({ getValue }: any) => {
        const onLeave = getValue()
        return (
          <div data-testid='status-cell'>
            {onLeave ? 'En congé' : 'Présent'}
          </div>
        )
      },
    },
  ],
}))

// Mock de @tanstack/react-table
jest.mock('@tanstack/react-table', () => ({
  flexRender: (component: any, context: any) => {
    if (typeof component === 'function') {
      return component(context)
    }
    return component
  },
  getCoreRowModel: () => jest.fn(),
  useReactTable: ({ data, columns }: any) => ({
    getHeaderGroups: () => [
      {
        id: 'header-group-1',
        headers: columns.map((col: any, index: number) => ({
          id: `header-${index}`,
          isPlaceholder: false,
          column: {
            columnDef: {
              header: col.header,
            },
          },
          getContext: () => ({}),
        })),
      },
    ],
    getRowModel: () => ({
      rows: data.map((item: any, index: number) => ({
        id: `row-${index}`,
        original: item,
        getIsSelected: () => false,
        getVisibleCells: () =>
          columns.map((col: any, colIndex: number) => ({
            id: `cell-${index}-${colIndex}`,
            column: {
              columnDef: {
                cell: col.cell,
              },
            },
            getContext: () => ({
              getValue: () => {
                if (col.accessorKey === 'user') return item.user
                if (col.accessorKey === 'user.email') return item.user.email
                if (col.accessorKey === 'onLeave') return item.onLeave
                return null
              },
              row: { original: item },
            }),
          })),
      })),
    }),
  }),
}))

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

const mockUser1: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  image: 'https://example.com/avatar1.jpg',
  emailVerified: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockUser2: User = {
  id: 'user-2',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  image: 'https://example.com/avatar2.jpg',
  emailVerified: false,
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
}

const mockMemberships: MembershipWithUserAndBalances[] = [
  {
    id: 'membership-1',
    user: mockUser1,
    onLeave: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    companyId: 'company-1',
    userId: 'user-1',
    role: 'EMPLOYEE',
    leaveBalances: [],
  },
  {
    id: 'membership-2',
    user: mockUser2,
    onLeave: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    companyId: 'company-1',
    userId: 'user-2',
    role: 'MANAGER',
    leaveBalances: [],
  },
]

describe('TeamDataTable', () => {
  beforeEach(() => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
      setActiveCompany: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('affiche un état de chargement', () => {
    mockUseGetMemberships.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Chargement des membres...')).toBeInTheDocument()
  })

  it("affiche un message d'erreur", () => {
    const error = new Error('Erreur de chargement')
    mockUseGetMemberships.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText('Erreur lors du chargement des membres')
    ).toBeInTheDocument()
  })

  it("affiche un message quand aucun membre n'est trouvé", () => {
    mockUseGetMemberships.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()
  })

  it('affiche le tableau avec les en-têtes', () => {
    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByTestId('table-header')).toBeInTheDocument()
    expect(screen.getByText('Employé')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Statut')).toBeInTheDocument()
  })

  it('affiche les données des membres dans le tableau', () => {
    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByTestId('table-body')).toBeInTheDocument()

    // Vérifie que les données des utilisateurs sont affichées
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
    expect(screen.getByText('Présent')).toBeInTheDocument()
    expect(screen.getByText('En congé')).toBeInTheDocument()
  })

  it('affiche le bon nombre de lignes de données', () => {
    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    const tableRows = screen.getAllByTestId('table-row')
    // 1 ligne d'en-tête + 2 lignes de données
    expect(tableRows).toHaveLength(3)
  })

  it("gère le cas où il n'y a pas de société active", () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    mockUseGetMemberships.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(mockUseGetMemberships).toHaveBeenCalledWith('')
  })

  it('applique les bonnes classes CSS au conteneur', () => {
    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    const container = screen.getByTestId('table').parentElement
    expect(container).toHaveClass('border-muted/30')
    expect(container).toHaveClass('overflow-hidden')
    expect(container).toHaveClass('rounded-lg')
    expect(container).toHaveClass('border')
    expect(container).toHaveClass('shadow-sm')
  })

  it('applique les bonnes classes CSS au tableau', () => {
    mockUseGetMemberships.mockReturnValue({
      data: mockMemberships,
      isLoading: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByTestId('table')).toHaveClass('w-full')
  })

  it('gère les données undefined', () => {
    mockUseGetMemberships.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()
  })

  it('gère les données null', () => {
    mockUseGetMemberships.mockReturnValue({
      data: null as any,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()
  })

  it('affiche le bon nombre de colonnes dans la ligne vide', () => {
    mockUseGetMemberships.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<TeamDataTable />, {
      wrapper: createWrapper(),
    })

    const emptyCell = screen.getByText('Aucun résultat.')
    expect(emptyCell).toHaveAttribute('colSpan', '3') // 3 colonnes mockées
  })
})
