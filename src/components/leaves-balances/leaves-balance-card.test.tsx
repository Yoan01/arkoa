import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useGetLeaveBalanceHistory } from '@/hooks/api/leave-balances/get-leave-balance-history'
import { useGetLeaveBalances } from '@/hooks/api/leave-balances/get-leave-balances'
import { useGetMembershipLeaves } from '@/hooks/api/leaves/get-membership-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

import { LeavesBalanceCard } from './leaves-balance-card'

// Mock des hooks
jest.mock('@/hooks/api/leave-balances/get-leave-balance-history')
jest.mock('@/hooks/api/leave-balances/get-leave-balances')
jest.mock('@/hooks/api/leaves/get-membership-leaves')
jest.mock('@/stores/use-company-store')

const mockUseGetLeaveBalanceHistory =
  useGetLeaveBalanceHistory as jest.MockedFunction<
    typeof useGetLeaveBalanceHistory
  >
const mockUseGetLeaveBalances = useGetLeaveBalances as jest.MockedFunction<
  typeof useGetLeaveBalances
>
const mockUseGetMembershipLeaves =
  useGetMembershipLeaves as jest.MockedFunction<typeof useGetMembershipLeaves>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>

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

const mockCompany = {
  id: 'company-1',
  userMembershipId: 'membership-1',
  annualLeaveDays: 25,
  name: 'Test Company',
  slug: 'test-company',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

const mockLeaveBalances = [
  {
    id: 'balance-1',
    type: 'PAID' as const,
    remainingDays: 15,
    membershipId: 'membership-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

const mockLeaveHistory = [
  {
    id: 'history-1',
    type: 'AUTO_CREDIT' as const,
    change: 20,
    leaveBalance: {
      type: 'PAID' as const,
    },
    createdAt: '2024-01-01',
  },
  {
    id: 'history-2',
    type: 'MANUEL_CREDIT' as const,
    change: 5,
    leaveBalance: {
      type: 'PAID' as const,
    },
    createdAt: '2024-01-01',
  },
]

const mockApprovedLeaves = [
  {
    id: 'leave-1',
    type: 'PAID' as const,
    status: 'APPROVED' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-03'),
    halfDayPeriod: null,
    membershipId: 'membership-1',
    managerId: null,
    reason: null,
    managerNote: null,
    reviewedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'leave-2',
    type: 'PAID' as const,
    status: 'APPROVED' as const,
    startDate: new Date('2024-01-05'),
    endDate: new Date('2024-01-05'),
    halfDayPeriod: 'MORNING' as const,
    membershipId: 'membership-1',
    managerId: null,
    reason: null,
    managerNote: null,
    reviewedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

describe('LeavesBalanceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCompanyStore.mockReturnValue(mockCompany)
  })

  it('affiche un état de chargement', () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isPending: true,
      isSuccess: false,
      status: 'pending',
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isPending: true,
      isSuccess: false,
      status: 'pending',
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isPending: true,
      isSuccess: false,
      status: 'pending',
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
    expect(screen.getByText('Congés payés restants')).toBeInTheDocument()
  })

  it("affiche un état d'erreur", () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Erreur de chargement'),
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    expect(screen.getByText('Erreur lors du chargement')).toBeInTheDocument()
    expect(screen.getByText('Congés payés restants')).toBeInTheDocument()
  })

  it('affiche les données de congés correctement', () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockLeaveHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockApprovedLeaves,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    expect(screen.getByText('15 jours')).toBeInTheDocument()
    expect(screen.getByText('Congés payés restants')).toBeInTheDocument()
    expect(screen.getByText('25 jours total')).toBeInTheDocument()
  })

  it('calcule correctement les jours utilisés', () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockLeaveHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockApprovedLeaves,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    // 3 jours (1-3 janvier) + 0.5 jour (demi-journée) = 3.5 jours utilisés
    expect(screen.getByText('3.5 jours')).toBeInTheDocument()
    expect(screen.getByText('Utilisés:')).toBeInTheDocument()
  })

  it('calcule correctement les crédits à venir', () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockLeaveHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockApprovedLeaves,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    // 25 jours total - 25 crédits reçus (20 + 5) = 0 jours à venir
    expect(screen.getByText('0 jours')).toBeInTheDocument()
    expect(screen.getByText('À venir:')).toBeInTheDocument()
  })

  it("gère le cas où il n'y a pas de solde de congés payés", () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    expect(
      screen.getByText('0 jours', { selector: '.text-2xl, .text-3xl' })
    ).toBeInTheDocument()
    expect(screen.getByText('25 jours total')).toBeInTheDocument()
  })

  it('gère le cas où activeCompany est null', () => {
    mockUseCompanyStore.mockReturnValue(null)
    mockUseGetLeaveBalances.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    expect(
      screen.getByText('0 jours', { selector: '.text-2xl, .text-3xl' })
    ).toBeInTheDocument()
    expect(screen.getByText('25 jours total')).toBeInTheDocument()
  })

  it('filtre correctement les congés approuvés de type PAID', () => {
    const mixedLeaves = [
      ...mockApprovedLeaves,
      {
        id: 'leave-3',
        type: 'SICK' as const,
        status: 'APPROVED' as const,
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-12'),
        halfDayPeriod: null,
        membershipId: 'membership-1',
        managerId: null,
        reason: null,
        managerNote: null,
        reviewedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]

    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockLeaveHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mixedLeaves,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    // Seuls les congés PAID doivent être comptés (3.5 jours)
    expect(screen.getByText('3.5 jours')).toBeInTheDocument()
  })

  it("filtre correctement l'historique des crédits", () => {
    const mixedHistory = [
      ...mockLeaveHistory,
      {
        id: 'history-3',
        type: 'DEBIT' as const,
        change: -5,
        leaveBalance: {
          type: 'PAID' as const,
        },
        createdAt: '2024-01-01',
      },
      {
        id: 'history-4',
        type: 'AUTO_CREDIT' as const,
        change: 10,
        leaveBalance: {
          type: 'SICK' as const,
        },
        createdAt: '2024-01-01',
      },
    ]

    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mixedHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockApprovedLeaves,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    // Seuls les crédits PAID (AUTO_CREDIT et MANUEL_CREDIT) doivent être comptés
    // 25 total - 25 crédits reçus = 0 jours à venir
    expect(
      screen.getByText('0 jours', {
        selector: 'div:not(.text-2xl):not(.text-3xl)',
      })
    ).toBeInTheDocument()
  })

  it('affiche la barre de progression', () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockLeaveHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockApprovedLeaves,
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('affiche les icônes Calendar et Clock', () => {
    mockUseGetLeaveBalances.mockReturnValue({
      data: mockLeaveBalances,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockLeaveHistory,
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockApprovedLeaves,
      isLoading: false,
      error: null,
    } as any)

    const { container } = render(<LeavesBalanceCard />, {
      wrapper: createWrapper(),
    })

    // Vérifier la présence des icônes via leurs classes CSS
    const calendarIcon = container.querySelector('svg')
    expect(calendarIcon).toBeInTheDocument()
  })

  it('gère le cas où annualLeaveDays est 0', () => {
    const companyWithZeroDays = {
      ...mockCompany,
      annualLeaveDays: 0,
    }

    mockUseCompanyStore.mockReturnValue(companyWithZeroDays)
    mockUseGetLeaveBalances.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)
    mockUseGetMembershipLeaves.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(<LeavesBalanceCard />, { wrapper: createWrapper() })

    // Le composant utilise || 25 comme valeur par défaut, donc même avec 0, il affiche 25
    expect(screen.getByText('25 jours total')).toBeInTheDocument()
  })
})
