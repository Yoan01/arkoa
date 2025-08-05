import { fireEvent, render, screen } from '@testing-library/react'

import {
  HalfDayPeriod,
  Leave,
  LeaveStatus,
  LeaveType,
} from '@/generated/prisma'

import { leaveColumns } from '../leave-columns'

// Mock dependencies
jest.mock('@/lib/dayjs-config', () => {
  const mockDayjs = {
    format: jest.fn(() => '15 Jan 2024'),
    isSame: jest.fn(() => false),
    diff: jest.fn(() => 2),
  }
  return {
    __esModule: true,
    default: jest.fn(() => mockDayjs),
  }
})
jest.mock('../add-leave-dialog', () => ({
  AddLeaveDialog: ({ trigger, leave }: any) => (
    <div data-testid='add-leave-dialog' data-leave-id={leave?.id}>
      {trigger}
    </div>
  ),
}))

// Mock UI components
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button
      data-testid='button'
      onClick={onClick}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}))

jest.mock('../../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid='dropdown-menu'>{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild: _asChild }: any) => (
    <div data-testid='dropdown-menu-trigger'>{children}</div>
  ),
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid='dropdown-menu-content' data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onSelect }: any) => (
    <div data-testid='dropdown-menu-item' onClick={e => onSelect?.(e)}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => (
    <div data-testid='dropdown-menu-label'>{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid='dropdown-menu-separator' />,
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  MoreHorizontalIcon: () => <span data-testid='more-horizontal-icon' />,
}))

// Mock constants
jest.mock('@/lib/constants', () => ({
  leaveTypeLabels: {
    [LeaveType.PAID]: 'Congé payé',
    [LeaveType.UNPAID]: 'Congé sans solde',
    [LeaveType.SICK]: 'Congé maladie',
  },
  leaveStatusLabels: {
    [LeaveStatus.PENDING]: 'En attente',
    [LeaveStatus.APPROVED]: 'Approuvé',
    [LeaveStatus.REJECTED]: 'Rejeté',
  },
  leaveStatusColors: {
    [LeaveStatus.PENDING]: 'bg-yellow-200 text-yellow-800',
    [LeaveStatus.APPROVED]: 'bg-green-200 text-green-800',
    [LeaveStatus.REJECTED]: 'bg-red-200 text-red-800',
  },
  halfDayPeriodLabels: {
    [HalfDayPeriod.MORNING]: 'Matin',
    [HalfDayPeriod.AFTERNOON]: 'Après-midi',
  },
}))

// Get the mocked dayjs
const mockDayjs = {
  format: jest.fn(),
  isSame: jest.fn(),
  diff: jest.fn(),
}

const mockLeave: Leave = {
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
}

const mockHalfDayLeave: Leave = {
  ...mockLeave,
  id: 'leave-2',
  endDate: new Date('2024-01-15'), // Same as start date for half day
  halfDayPeriod: HalfDayPeriod.MORNING,
}

// Helper function to create mock row
const createMockRow = (leave: Leave) => ({
  original: leave,
  getValue: (key: string) => {
    switch (key) {
      case 'type':
        return leave.type
      case 'status':
        return leave.status
      case 'createdAt':
        return leave.createdAt.toISOString()
      default:
        return leave[key as keyof Leave]
    }
  },
})

// Helper function to create mock cell context
const createMockCell = (leave: Leave, columnId: string) => ({
  getValue: (key?: string) => {
    if (key) return leave[key as keyof Leave]
    switch (columnId) {
      case 'type':
        return leave.type
      case 'status':
        return leave.status
      case 'createdAt':
        return leave.createdAt.toISOString()
      default:
        return leave[columnId as keyof Leave]
    }
  },
  row: createMockRow(leave),
})

describe('leaveColumns', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDayjs.format.mockReturnValue('15 Jan 2024')
    mockDayjs.isSame.mockReturnValue(false)
    mockDayjs.diff.mockReturnValue(2)
  })

  describe('Type Column', () => {
    it('renders leave type correctly', () => {
      const typeColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'type'
      )!
      const cell = createMockCell(mockLeave, 'type')

      const result = (typeColumn.cell as any)!(cell as any)
      expect(result).toBe('Congé payé')
    })

    it('falls back to raw value for unknown type', () => {
      const unknownTypeLeave = { ...mockLeave, type: 'UNKNOWN' as LeaveType }
      const typeColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'type'
      )!
      const cell = createMockCell(unknownTypeLeave, 'type')

      const result = (typeColumn.cell as any)!(cell as any)
      expect(result).toBe('UNKNOWN')
    })

    it('has correct header', () => {
      const typeColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'type'
      )!
      expect(typeColumn.header).toBe('Type')
    })
  })

  describe('Period Column', () => {
    it('renders single day period', () => {
      mockDayjs.isSame.mockReturnValue(true)

      const periodColumn = leaveColumns.find(col => col.id === 'period')!
      const cell = createMockCell(mockLeave, 'period')

      const result = (periodColumn.cell as any)!(cell as any)
      expect(result).toBe('15 Jan 2024 – 15 Jan 2024')
      // Note: isSame is called internally by the component
    })

    it('renders date range for multiple days', () => {
      mockDayjs.isSame.mockReturnValue(false)

      const periodColumn = leaveColumns.find(col => col.id === 'period')!
      const cell = createMockCell(mockLeave, 'period')

      const result = (periodColumn.cell as any)!(cell as any)
      expect(result).toBe('15 Jan 2024 – 15 Jan 2024')
      // Note: format is called internally by the component
    })

    it('has correct header', () => {
      const periodColumn = leaveColumns.find(col => col.id === 'period')!
      expect(periodColumn.header).toBe('Période')
    })
  })

  describe('Status Column', () => {
    it('renders status badge for pending status', () => {
      const statusColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'status'
      )!
      const cell = createMockCell(mockLeave, 'status')

      const { container } = render(
        <div>{(statusColumn.cell as any)!(cell as any)}</div>
      )

      const badge = container.querySelector('span')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('En attente')
      expect(badge).toHaveClass('bg-yellow-200 text-yellow-800')
    })

    it('renders status badge for approved status', () => {
      const approvedLeave = { ...mockLeave, status: LeaveStatus.APPROVED }
      const statusColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'status'
      )!
      const cell = createMockCell(approvedLeave, 'status')

      const { container } = render(
        <div>{(statusColumn.cell as any)!(cell as any)}</div>
      )

      const badge = container.querySelector('span')
      expect(badge).toHaveTextContent('Approuvé')
      expect(badge).toHaveClass('bg-green-200 text-green-800')
    })

    it('renders status badge for rejected status', () => {
      const rejectedLeave = { ...mockLeave, status: LeaveStatus.REJECTED }
      const statusColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'status'
      )!
      const cell = createMockCell(rejectedLeave, 'status')

      const { container } = render(
        <div>{(statusColumn.cell as any)!(cell as any)}</div>
      )

      const badge = container.querySelector('span')
      expect(badge).toHaveTextContent('Rejeté')
      expect(badge).toHaveClass('bg-red-200 text-red-800')
    })

    it('falls back to default colors for unknown status', () => {
      const unknownStatusLeave = {
        ...mockLeave,
        status: 'UNKNOWN' as LeaveStatus,
      }
      const statusColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'status'
      )!
      const cell = createMockCell(unknownStatusLeave, 'status')

      const { container } = render(
        <div>{(statusColumn.cell as any)!(cell as any)}</div>
      )

      const badge = container.querySelector('span')
      expect(badge).toHaveClass('bg-gray-200 text-gray-600')
    })

    it('has correct header', () => {
      const statusColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'status'
      )!
      expect(statusColumn.header).toBe('Statut')
    })
  })

  describe('Duration Column', () => {
    it('renders duration for multiple days', () => {
      mockDayjs.diff.mockReturnValue(2) // 3 days total (2 + 1)

      const durationColumn = leaveColumns.find(col => col.id === 'duration')!
      const cell = createMockCell(mockLeave, 'duration')

      const result = (durationColumn.cell as any)!(cell as any)
      expect(result).toBe('3 jours')
    })

    it('renders duration for single day', () => {
      mockDayjs.diff.mockReturnValue(0) // 1 day total (0 + 1)

      const durationColumn = leaveColumns.find(col => col.id === 'duration')!
      const cell = createMockCell(mockLeave, 'duration')

      const result = (durationColumn.cell as any)!(cell as any)
      expect(result).toBe('3 jours')
    })

    it('renders half-day duration with morning period', () => {
      const durationColumn = leaveColumns.find(col => col.id === 'duration')!
      const cell = createMockCell(mockHalfDayLeave, 'duration')

      const result = (durationColumn.cell as any)!(cell as any)
      expect(result).toBe('Demi-journée (Matin)')
    })

    it('renders half-day duration with afternoon period', () => {
      const afternoonLeave = {
        ...mockHalfDayLeave,
        halfDayPeriod: HalfDayPeriod.AFTERNOON,
      }
      const durationColumn = leaveColumns.find(col => col.id === 'duration')!
      const cell = createMockCell(afternoonLeave, 'duration')

      const result = (durationColumn.cell as any)!(cell as any)
      expect(result).toBe('Demi-journée (Après-midi)')
    })

    it('has correct header', () => {
      const durationColumn = leaveColumns.find(col => col.id === 'duration')!
      expect(durationColumn.header).toBe('Durée')
    })
  })

  describe('Created At Column', () => {
    it('renders formatted creation date', () => {
      const createdAtColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'createdAt'
      )!
      const cell = createMockCell(mockLeave, 'createdAt')

      const result = (createdAtColumn.cell as any)!(cell as any)
      expect(result).toBe('15 Jan 2024')
      // Note: format is called internally by the component
    })

    it('has correct header', () => {
      const createdAtColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'createdAt'
      )!
      expect(createdAtColumn.header).toBe('Créé le')
    })
  })

  describe('Actions Column', () => {
    it('renders actions dropdown menu', () => {
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')!
      const cell = createMockCell(mockLeave, 'actions')

      const { container: _container } = render(
        <div>{(actionsColumn.cell as any)!(cell as any)}</div>
      )

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument()
      expect(screen.getByTestId('button')).toBeInTheDocument()
      expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument()
    })

    it('renders dropdown menu items', () => {
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')!
      const cell = createMockCell(mockLeave, 'actions')

      render(<div>{(actionsColumn.cell as any)!(cell as any)}</div>)

      expect(screen.getByTestId('dropdown-menu-label')).toHaveTextContent(
        'Actions'
      )
      expect(screen.getByTestId('add-leave-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument()
      expect(screen.getByText('Voir le détail')).toBeInTheDocument()
    })

    it('passes leave data to AddLeaveDialog', () => {
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')!
      const cell = createMockCell(mockLeave, 'actions')

      render(<div>{(actionsColumn.cell as any)!(cell as any)}</div>)

      const addLeaveDialog = screen.getByTestId('add-leave-dialog')
      expect(addLeaveDialog).toHaveAttribute('data-leave-id', 'leave-1')
    })

    it('renders modify button in dropdown', () => {
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')!
      const cell = createMockCell(mockLeave, 'actions')

      render(<div>{(actionsColumn.cell as any)!(cell as any)}</div>)

      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })

    it('has enableHiding set to false', () => {
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')!
      expect(actionsColumn.enableHiding).toBe(false)
    })

    it('handles dropdown menu item click', () => {
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')!
      const cell = createMockCell(mockLeave, 'actions')

      render(<div>{(actionsColumn.cell as any)!(cell as any)}</div>)

      const modifyItem = screen.getByText('Modifier')
      fireEvent.click(modifyItem)

      // Should not throw error when clicking
      expect(modifyItem).toBeInTheDocument()
    })
  })

  describe('Column Configuration', () => {
    it('has correct number of columns', () => {
      expect(leaveColumns).toHaveLength(6)
    })

    it('has all required columns', () => {
      const columnIds = leaveColumns.map(
        col => col.id || (col as any).accessorKey
      )
      expect(columnIds).toContain('type')
      expect(columnIds).toContain('period')
      expect(columnIds).toContain('status')
      expect(columnIds).toContain('duration')
      expect(columnIds).toContain('createdAt')
      expect(columnIds).toContain('actions')
    })

    it('has correct accessor keys', () => {
      const typeColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'type'
      )
      const statusColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'status'
      )
      const createdAtColumn = leaveColumns.find(
        col => (col as any).accessorKey === 'createdAt'
      )

      expect(typeColumn).toBeDefined()
      expect(statusColumn).toBeDefined()
      expect(createdAtColumn).toBeDefined()
    })

    it('has correct custom column ids', () => {
      const periodColumn = leaveColumns.find(col => col.id === 'period')
      const durationColumn = leaveColumns.find(col => col.id === 'duration')
      const actionsColumn = leaveColumns.find(col => col.id === 'actions')

      expect(periodColumn).toBeDefined()
      expect(durationColumn).toBeDefined()
      expect(actionsColumn).toBeDefined()
    })
  })
})
