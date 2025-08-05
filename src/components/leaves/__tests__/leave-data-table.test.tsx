import { render, screen } from '@testing-library/react'

import { Leave, LeaveStatus, LeaveType } from '@/generated/prisma'

import { LeaveDataTable } from '../leave-data-table'

// Mock dependencies
jest.mock('@/hooks/api/leaves/get-leaves')
jest.mock('@/stores/use-company-store')
jest.mock('../leave-columns', () => ({
  leaveColumns: [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }: any) => getValue(),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ getValue }: any) => getValue(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => <button>Actions</button>,
      enableHiding: false,
    },
  ],
}))

// Mock UI components
jest.mock('@/components/ui/table', () => ({
  Table: ({ children, className }: any) => (
    <table data-testid='table' className={className}>
      {children}
    </table>
  ),
  TableHeader: ({ children }: any) => (
    <thead data-testid='table-header'>{children}</thead>
  ),
  TableBody: ({ children }: any) => (
    <tbody data-testid='table-body'>{children}</tbody>
  ),
  TableRow: ({ children, className, 'data-state': dataState }: any) => (
    <tr data-testid='table-row' className={className} data-state={dataState}>
      {children}
    </tr>
  ),
  TableHead: ({ children, className }: any) => (
    <th data-testid='table-head' className={className}>
      {children}
    </th>
  ),
  TableCell: ({ children, className, colSpan }: any) => (
    <td data-testid='table-cell' className={className} colSpan={colSpan}>
      {children}
    </td>
  ),
}))

// Mock react-table
jest.mock('@tanstack/react-table', () => ({
  flexRender: jest.fn((component, context) => {
    if (typeof component === 'function') {
      return component(context)
    }
    return component
  }),
  getCoreRowModel: jest.fn(() => 'coreRowModel'),
  useReactTable: jest.fn(),
}))

import { flexRender, useReactTable } from '@tanstack/react-table'

import { useGetLeaves } from '@/hooks/api/leaves/get-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

const mockUseGetLeaves = useGetLeaves as jest.MockedFunction<
  typeof useGetLeaves
>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>
const mockUseReactTable = useReactTable as jest.MockedFunction<
  typeof useReactTable
>
const mockFlexRender = flexRender as jest.MockedFunction<typeof flexRender>

const mockLeaves: Leave[] = [
  {
    id: 'leave-1',
    type: LeaveType.PAID,
    status: LeaveStatus.PENDING,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17'),
    halfDayPeriod: null,
    reason: 'Vacation',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    membershipId: 'membership-1',
    managerId: null,
    reviewedAt: null,
    managerNote: null,
  },
  {
    id: 'leave-2',
    type: LeaveType.SICK,
    status: LeaveStatus.APPROVED,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-22'),
    halfDayPeriod: null,
    reason: 'Sick leave',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    membershipId: 'membership-1',
    managerId: 'manager-1',
    reviewedAt: new Date('2024-01-19'),
    managerNote: 'Approved',
  },
]

const mockCompany = {
  id: 'company-1',
  userMembershipId: 'membership-1',
  name: 'Test Company',
}

// Mock table instance
const createMockTable = (data: Leave[] = []) => ({
  getHeaderGroups: () => [
    {
      id: 'header-group-1',
      headers: [
        {
          id: 'type',
          isPlaceholder: false,
          column: {
            columnDef: {
              header: 'Type',
            },
          },
          getContext: () => ({}),
        },
        {
          id: 'status',
          isPlaceholder: false,
          column: {
            columnDef: {
              header: 'Statut',
            },
          },
          getContext: () => ({}),
        },
        {
          id: 'actions',
          isPlaceholder: false,
          column: {
            columnDef: {
              header: 'Actions',
            },
          },
          getContext: () => ({}),
        },
      ],
    },
  ],
  getRowModel: () => ({
    rows: data.map((leave, index) => ({
      id: `row-${index}`,
      getIsSelected: () => false,
      getVisibleCells: () => [
        {
          id: `cell-${index}-type`,
          column: {
            columnDef: {
              cell: ({ getValue: _getValue }: any) => leave.type,
            },
          },
          getContext: () => ({ getValue: () => leave.type }),
        },
        {
          id: `cell-${index}-status`,
          column: {
            columnDef: {
              cell: ({ getValue: _getValue }: any) => leave.status,
            },
          },
          getContext: () => ({ getValue: () => leave.status }),
        },
        {
          id: `cell-${index}-actions`,
          column: {
            columnDef: {
              cell: () => <button>Actions</button>,
            },
          },
          getContext: () => ({}),
        },
      ],
    })),
  }),
})

describe('LeaveDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseCompanyStore.mockReturnValue({
      activeCompany: mockCompany,
      setActiveCompany: jest.fn(),
      clearActiveCompany: jest.fn(),
    })

    mockFlexRender.mockImplementation((component, context) => {
      if (typeof component === 'function') {
        return (component as any)(context)
      }
      return component
    })
  })

  describe('Rendering', () => {
    it('renders table with data', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      expect(screen.getByTestId('table')).toBeInTheDocument()
      expect(screen.getByTestId('table-header')).toBeInTheDocument()
      expect(screen.getByTestId('table-body')).toBeInTheDocument()
    })

    it('renders table headers correctly', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      const headers = screen.getAllByTestId('table-head')
      expect(headers).toHaveLength(3)
      expect(headers[0]).toHaveTextContent('Type')
      expect(headers[1]).toHaveTextContent('Statut')
      expect(headers[2]).toHaveTextContent('Actions')
    })

    it('renders table rows with data', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      const rows = screen.getAllByTestId('table-row')
      expect(rows).toHaveLength(3) // 1 header + 2 data rows

      const cells = screen.getAllByTestId('table-cell')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('renders empty state when no data', () => {
      mockUseGetLeaves.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable([]) as any)

      render(<LeaveDataTable />)

      expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()

      const emptyCell = screen.getByTestId('table-cell')
      expect(emptyCell).toHaveAttribute('colSpan', '3')
    })

    it('renders empty state when data is undefined', () => {
      mockUseGetLeaves.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable([]) as any)

      render(<LeaveDataTable />)

      expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()
    })
  })

  describe('Data Fetching', () => {
    it('calls useGetLeaves with correct parameters', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      expect(mockUseGetLeaves).toHaveBeenCalledWith({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })
    })

    it('handles missing activeCompany gracefully', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        setActiveCompany: jest.fn(),
        clearActiveCompany: jest.fn(),
      })

      mockUseGetLeaves.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable([]) as any)

      render(<LeaveDataTable />)

      expect(mockUseGetLeaves).toHaveBeenCalledWith({
        companyId: '',
        membershipId: '',
      })
    })

    it('handles missing userMembershipId gracefully', () => {
      const companyWithoutMembership = {
        id: 'company-1',
        userMembershipId: undefined,
        name: 'Test Company',
      }

      mockUseCompanyStore.mockReturnValue({
        activeCompany: companyWithoutMembership,
        setActiveCompany: jest.fn(),
        clearActiveCompany: jest.fn(),
      })

      mockUseGetLeaves.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable([]) as any)

      render(<LeaveDataTable />)

      expect(mockUseGetLeaves).toHaveBeenCalledWith({
        companyId: 'company-1',
        membershipId: '',
      })
    })
  })

  describe('Table Configuration', () => {
    it('configures react-table with correct options', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      expect(mockUseReactTable).toHaveBeenCalledWith({
        data: mockLeaves,
        columns: expect.any(Array),
        getCoreRowModel: 'coreRowModel',
      })
    })

    it('uses empty array as fallback for data', () => {
      mockUseGetLeaves.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable([]) as any)

      render(<LeaveDataTable />)

      expect(mockUseReactTable).toHaveBeenCalledWith({
        data: [],
        columns: expect.any(Array),
        getCoreRowModel: 'coreRowModel',
      })
    })
  })

  describe('Styling and Classes', () => {
    it('applies correct CSS classes to table container', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      const { container } = render(<LeaveDataTable />)

      const tableContainer = container.firstChild
      expect(tableContainer).toHaveClass(
        'border-muted/30 overflow-hidden rounded-lg border shadow-sm'
      )
    })

    it('applies correct CSS classes to table', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      const table = screen.getByTestId('table')
      expect(table).toHaveClass('w-full')
    })

    it('applies correct CSS classes to table headers', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      const headers = screen.getAllByTestId('table-head')
      headers.forEach(header => {
        expect(header).toHaveClass(
          'px-4 py-2 text-center text-xs font-medium uppercase'
        )
      })
    })

    it('applies correct CSS classes to table cells', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      const cells = screen.getAllByTestId('table-cell')
      cells.forEach(cell => {
        expect(cell).toHaveClass('px-4 py-3 text-center align-middle text-sm')
      })
    })

    it('applies hover styles to table rows', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      const rows = screen.getAllByTestId('table-row')
      // Skip header row
      const dataRows = rows.slice(1)
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-muted/10 transition-colors')
      })
    })

    it('applies correct styles to empty state cell', () => {
      mockUseGetLeaves.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable([]) as any)

      render(<LeaveDataTable />)

      const emptyCell = screen.getByText('Aucun résultat.')
      expect(emptyCell).toHaveClass('text-muted-foreground h-24 text-center')
    })
  })

  describe('FlexRender Integration', () => {
    it('calls flexRender for headers', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      expect(mockFlexRender).toHaveBeenCalledWith('Type', expect.any(Object))
      expect(mockFlexRender).toHaveBeenCalledWith('Statut', expect.any(Object))
      expect(mockFlexRender).toHaveBeenCalledWith('Actions', expect.any(Object))
    })

    it('calls flexRender for cells', () => {
      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(createMockTable(mockLeaves) as any)

      render(<LeaveDataTable />)

      expect(mockFlexRender).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          getValue: expect.any(Function),
        })
      )
    })

    it('skips rendering placeholder headers', () => {
      const tableWithPlaceholder = {
        ...createMockTable(mockLeaves),
        getHeaderGroups: () => [
          {
            id: 'header-group-1',
            headers: [
              {
                id: 'placeholder',
                isPlaceholder: true,
                column: {
                  columnDef: {
                    header: 'Placeholder',
                  },
                },
                getContext: () => ({}),
              },
              {
                id: 'type',
                isPlaceholder: false,
                column: {
                  columnDef: {
                    header: 'Type',
                  },
                },
                getContext: () => ({}),
              },
            ],
          },
        ],
      }

      mockUseGetLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
      } as any)

      mockUseReactTable.mockReturnValue(tableWithPlaceholder as any)

      render(<LeaveDataTable />)

      expect(mockFlexRender).not.toHaveBeenCalledWith(
        'Placeholder',
        expect.any(Object)
      )
      expect(mockFlexRender).toHaveBeenCalledWith('Type', expect.any(Object))
    })
  })
})
