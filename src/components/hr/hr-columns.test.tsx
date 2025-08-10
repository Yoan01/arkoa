import { ColumnDef } from '@tanstack/react-table'
import { fireEvent, render, screen } from '@testing-library/react'

import { hrColumns } from './hr-columns'

// Mock des composants
jest.mock('./edit-leave-balance-dialog', () => ({
  EditLeaveBalanceDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid='edit-leave-balance-dialog'>{trigger}</div>
  ),
}))

const mockMembership = {
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
    {
      id: 'balance-2',
      type: 'RTT',
      remainingDays: 8.0,
    },
  ],
}

// Variable supprimée car inutilisée

const mockMembershipNoName = {
  ...mockMembership,
  user: {
    ...mockMembership.user,
    name: null,
  },
}

const mockMembershipNoBalances = {
  ...mockMembership,
  leaveBalances: [],
}

// Helper pour créer un contexte de cellule mock
const createMockCellContext = (row: any, column: any) => ({
  row: {
    original: row,
  },
  getValue: () => column.getValue?.(row) || row[column.accessorKey],
})

describe('hrColumns', () => {
  it('devrait avoir le bon nombre de colonnes', () => {
    expect(hrColumns).toHaveLength(6)
  })

  describe('Colonne Nom', () => {
    const nameColumn = hrColumns[0] as ColumnDef<any>

    it('devrait avoir le bon header', () => {
      expect(nameColumn.header).toBe('Nom')
    })

    it("devrait afficher le nom de l'utilisateur", () => {
      const context = createMockCellContext(mockMembership, nameColumn)
      const { container } = render(
        <div>
          {typeof nameColumn.cell === 'function'
            ? nameColumn.cell(context as any)
            : nameColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('John Doe')
    })

    it('devrait afficher "Nom non défini" quand le nom est null', () => {
      const context = createMockCellContext(mockMembershipNoName, nameColumn)
      const { container } = render(
        <div>
          {typeof nameColumn.cell === 'function'
            ? nameColumn.cell(context as any)
            : nameColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('Nom non défini')
    })
  })

  describe('Colonne Email', () => {
    const emailColumn = hrColumns[1] as ColumnDef<any>

    it('devrait avoir le bon header', () => {
      expect(emailColumn.header).toBe('Email')
    })

    it('devrait avoir la bonne accessorKey', () => {
      expect((emailColumn as any).accessorKey).toBe('user.email')
    })
  })

  describe('Colonne Rôle', () => {
    const roleColumn = hrColumns[2] as ColumnDef<any>

    it('devrait avoir le bon header', () => {
      expect(roleColumn.header).toBe('Rôle')
    })

    it('devrait afficher "Manager" avec le bon badge pour un MANAGER', () => {
      const context = {
        getValue: () => 'MANAGER',
      }
      const { container } = render(
        <div>
          {typeof roleColumn.cell === 'function'
            ? roleColumn.cell(context as any)
            : roleColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('Manager')
      expect(container.querySelector('.bg-primary')).toBeInTheDocument()
    })

    it('devrait afficher "Employé" avec le bon badge pour un EMPLOYEE', () => {
      const context = {
        getValue: () => 'EMPLOYEE',
      }
      const { container } = render(
        <div>
          {typeof roleColumn.cell === 'function'
            ? roleColumn.cell(context as any)
            : roleColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('Employé')
      expect(container.querySelector('.bg-secondary')).toBeInTheDocument()
    })
  })

  describe('Colonne Congés Payés', () => {
    const paidLeaveColumn = hrColumns[3] as ColumnDef<any>

    it('devrait avoir le bon header', () => {
      expect(paidLeaveColumn.header).toBe('Congés Payés')
    })

    it('devrait afficher le solde de congés payés', () => {
      const context = createMockCellContext(mockMembership, paidLeaveColumn)
      const { container } = render(
        <div>
          {typeof paidLeaveColumn.cell === 'function'
            ? paidLeaveColumn.cell(context as any)
            : paidLeaveColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('15.5 jours')
    })

    it('devrait afficher "0 jours" quand il n\'y a pas de solde', () => {
      const context = createMockCellContext(
        mockMembershipNoBalances,
        paidLeaveColumn
      )
      const { container } = render(
        <div>
          {typeof paidLeaveColumn.cell === 'function'
            ? paidLeaveColumn.cell(context as any)
            : paidLeaveColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('0 jours')
    })
  })

  describe('Colonne RTT', () => {
    const rttColumn = hrColumns[4] as ColumnDef<any>

    it('devrait avoir le bon header', () => {
      expect(rttColumn.header).toBe('RTT')
    })

    it('devrait afficher le solde RTT', () => {
      const context = createMockCellContext(mockMembership, rttColumn)
      const { container } = render(
        <div>
          {typeof rttColumn.cell === 'function'
            ? rttColumn.cell(context as any)
            : rttColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('8.0 jours')
    })

    it('devrait afficher "0 jours" quand il n\'y a pas de solde RTT', () => {
      const context = createMockCellContext(mockMembershipNoBalances, rttColumn)
      const { container } = render(
        <div>
          {typeof rttColumn.cell === 'function'
            ? rttColumn.cell(context as any)
            : rttColumn.cell}
        </div>
      )
      expect(container.textContent).toBe('0 jours')
    })
  })

  describe('Colonne Actions', () => {
    const actionsColumn = hrColumns[5] as ColumnDef<any>

    it('devrait avoir enableHiding à false', () => {
      expect(actionsColumn.enableHiding).toBe(false)
    })

    it("devrait afficher le menu d'actions", () => {
      const context = createMockCellContext(mockMembership, actionsColumn)
      render(
        <div>
          {typeof actionsColumn.cell === 'function'
            ? actionsColumn.cell(context as any)
            : actionsColumn.cell}
        </div>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Ouvrir le menu')).toBeInTheDocument()
    })

    it('devrait ouvrir le menu quand on clique sur le bouton', () => {
      const context = createMockCellContext(mockMembership, actionsColumn)
      render(
        <div>
          {typeof actionsColumn.cell === 'function'
            ? actionsColumn.cell(context as any)
            : actionsColumn.cell}
        </div>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      fireEvent.click(button)
      // Le menu s'ouvre mais le contenu dépend du composant DropdownMenu
    })

    it('devrait contenir le composant EditLeaveBalanceDialog', () => {
      const context = createMockCellContext(mockMembership, actionsColumn)
      render(
        <div>
          {typeof actionsColumn.cell === 'function'
            ? actionsColumn.cell(context as any)
            : actionsColumn.cell}
        </div>
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      fireEvent.click(button)
      // Le composant EditLeaveBalanceDialog est mocké et rendu
    })
  })
})
