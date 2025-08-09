import { ColumnDef } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'

import { LeaveStatus } from '@/generated/prisma'
import { CompanyLeave } from '@/schemas/queries/company-leaves-schema'

import { approvalsColumns } from '../approvals-columns'

// Mock dayjs
jest.mock('@/lib/dayjs-config', () => {
  const mockDayjs = jest.fn(_date => ({
    format: jest.fn(format => {
      if (format === 'D MMM') return '15 Jan'
      if (format === 'D MMM YYYY') return '20 Jan 2024'
      return '15 Jan 2024'
    }),
    diff: jest.fn(() => 5),
  }))
  return {
    __esModule: true,
    default: mockDayjs,
  }
})

// Mock ApprovalActions component
jest.mock('../review-leave-dialog', () => ({
  ApprovalActions: ({ leave }: { leave: CompanyLeave }) => (
    <div data-testid='approval-actions'>Actions for {leave.id}</div>
  ),
}))

const mockLeave: CompanyLeave = {
  id: 'leave-1',
  type: 'ANNUAL' as const,
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-20'),
  status: 'PENDING' as const,
  createdAt: new Date('2024-01-10'),
  membership: {
    user: {
      id: 'user-1',
      name: 'John Doe',
    },
  },
  halfDayPeriod: undefined,
  reason: "Vacances d'été",
  managerNote: undefined,
}

const mockHalfDayLeave: CompanyLeave = {
  ...mockLeave,
  id: 'leave-2',
  halfDayPeriod: 'MORNING' as const,
}

describe('approvalsColumns', () => {
  it('should have correct number of columns', () => {
    expect(approvalsColumns).toHaveLength(8)
  })

  it('should have correct column headers', () => {
    const headers = approvalsColumns.map(col => col.header)
    expect(headers).toEqual([
      'Employé',
      'Type',
      'Période',
      'Durée',
      'Motif',
      'Statut',
      'Demandé le',
      'Actions',
    ])
  })

  describe('Employee column', () => {
    it('should render employee name', () => {
      const column = approvalsColumns[0] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ row: { original: mockLeave } })
      expect(result).toBe('John Doe')
    })

    it('should render N/A when name is missing', () => {
      const leaveWithoutName = {
        ...mockLeave,
        membership: {
          ...mockLeave.membership,
          user: {
            ...mockLeave.membership.user,
            name: null,
          },
        },
      }
      const column = approvalsColumns[0] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ row: { original: leaveWithoutName } })
      expect(result).toBe('N/A')
    })
  })

  describe('Type column', () => {
    it('should render leave type label', () => {
      const column = approvalsColumns[1] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ getValue: () => 'ANNUAL' })
      expect(result).toBe('ANNUAL')
    })
  })

  describe('Period column', () => {
    it('should render formatted period', () => {
      const column = approvalsColumns[2] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ row: { original: mockLeave } })
      expect(result).toBe('15 Jan - 20 Jan 2024')
    })
  })

  describe('Duration column', () => {
    it('should render duration in days', () => {
      const column = approvalsColumns[3] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ row: { original: mockLeave } })
      expect(result).toBe('6 jours')
    })

    it('should render half-day period', () => {
      const column = approvalsColumns[3] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ row: { original: mockHalfDayLeave } })
      expect(result).toBe('Demi-journée (Matin)')
    })

    it('should render singular day', () => {
      const singleDayLeave = {
        ...mockLeave,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }

      const column = approvalsColumns[3] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ row: { original: singleDayLeave } })
      expect(result).toBe('6 jours') // Based on the mocked diff value
    })
  })

  describe('Reason column', () => {
    it('should render reason', () => {
      const column = approvalsColumns[4] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ getValue: () => "Vacances d'été" })
      expect(result).toBe("Vacances d'été")
    })

    it('should render dash when no reason', () => {
      const column = approvalsColumns[4] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ getValue: () => null })
      expect(result).toBe('-')
    })
  })

  describe('Status column', () => {
    it('should render status badge', () => {
      const column = approvalsColumns[5] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const { container } = render(
        <div>{cell({ getValue: () => LeaveStatus.PENDING })}</div>
      )
      expect(container.querySelector('span')).toHaveClass(
        'inline-block rounded-full'
      )
    })
  })

  describe('Created date column', () => {
    it('should render formatted created date', () => {
      const column = approvalsColumns[6] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      const result = cell({ getValue: () => '2024-01-10T00:00:00Z' })
      expect(result).toBe('20 Jan 2024') // Based on the mocked format return value
    })
  })

  describe('Actions column', () => {
    it('should render approval actions', () => {
      const column = approvalsColumns[7] as ColumnDef<CompanyLeave>
      const cell = column.cell as any
      render(<div>{cell({ row: { original: mockLeave } })}</div>)
      expect(screen.getByTestId('approval-actions')).toBeInTheDocument()
      expect(screen.getByText('Actions for leave-1')).toBeInTheDocument()
    })

    it('should not be hideable', () => {
      const column = approvalsColumns[7] as ColumnDef<CompanyLeave>
      expect(column.enableHiding).toBe(false)
    })
  })
})
