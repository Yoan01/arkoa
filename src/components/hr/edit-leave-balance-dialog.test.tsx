import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock des dépendances
import { useUpdateLeaveBalance } from '@/hooks/api/leave-balances/update-leave-balance'
import { useCompanyStore } from '@/stores/use-company-store'

import { EditLeaveBalanceDialog } from './edit-leave-balance-dialog'

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

jest.mock('@/hooks/api/leave-balances/update-leave-balance', () => ({
  useUpdateLeaveBalance: jest.fn(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: jest.fn(),
}))

jest.mock('@/lib/constants', () => ({
  leaveTypeLabels: {
    PAID: 'Congés Payés',
    RTT: 'RTT',
    SICK: 'Congés Maladie',
  },
}))

const mockUseUpdateLeaveBalance =
  useUpdateLeaveBalance as jest.MockedFunction<any>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<any>

const mockMembership = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '1',
  companyId: '1',
  role: 'EMPLOYEE' as const,
  onLeave: false,
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
  },
  leaveBalances: [
    {
      id: '1',
      type: 'PAID',
      remainingDays: 15.5,
    },
    {
      id: '2',
      type: 'RTT',
      remainingDays: 8.0,
    },
  ],
}

const mockTrigger = <button>Modifier les congés</button>

const mockUpdateLeaveBalance = {
  mutateAsync: jest.fn(),
  mutate: jest.fn(),
  isPending: false,
  error: null,
  isError: false,
  isSuccess: false,
  data: undefined,
  reset: jest.fn(),
}

const mockCompanyStore = {
  activeCompany: {
    id: 'company-1',
    name: 'Test Company',
  },
}

describe('EditLeaveBalanceDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUpdateLeaveBalance.mockReturnValue(mockUpdateLeaveBalance)
    mockUseCompanyStore.mockReturnValue(mockCompanyStore)
  })

  it('devrait afficher le trigger correctement', () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    expect(screen.getByText('Modifier les congés')).toBeInTheDocument()
  })

  it('devrait ouvrir le dialog quand on clique sur le trigger', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      expect(
        screen.getByText('Modifier le solde de congés pour John Doe')
      ).toBeInTheDocument()
    })
  })

  it('devrait afficher les informations du membre', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      expect(
        screen.getByText('Modifier le solde de congés pour John Doe')
      ).toBeInTheDocument()
    })
  })

  it('devrait afficher les types de congés disponibles', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      expect(screen.getByText('Type de congé')).toBeInTheDocument()
    })
  })

  it('devrait calculer et afficher le solde actuel correctement', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      expect(screen.getAllByText('15.5 jours')).toHaveLength(2) // Solde actuel et nouveau solde
    })
  })

  it('devrait permettre de saisir une modification', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Ex: +5 ou -2.5')
      expect(input).toBeInTheDocument()
    })
  })

  it('devrait permettre de modifier la valeur du champ', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Ex: +5 ou -2.5')
      fireEvent.change(input, { target: { value: '5' } })
      expect(input).toHaveValue(5)
    })
  })

  it('devrait utiliser le hook useCompanyStore', () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    expect(mockUseCompanyStore).toHaveBeenCalled()
  })

  it('devrait utiliser le hook useUpdateLeaveBalance', () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    expect(mockUseUpdateLeaveBalance).toHaveBeenCalled()
  })

  it('devrait calculer le nouveau solde correctement', async () => {
    render(
      <EditLeaveBalanceDialog
        membership={mockMembership}
        trigger={mockTrigger}
      />
    )

    fireEvent.click(screen.getByText('Modifier les congés'))

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Ex: +5 ou -2.5')
      fireEvent.change(input, { target: { value: '5' } })
    })

    await waitFor(() => {
      expect(screen.getByText('20.5 jours')).toBeInTheDocument() // 15.5 + 5
    })
  })
})
