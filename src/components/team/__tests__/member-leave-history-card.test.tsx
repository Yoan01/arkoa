import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useGetLeaveBalanceHistory } from '@/hooks/api/leave-balances/get-leave-balance-history'

import { MemberLeaveHistoryCard } from '../member-leave-history-card'

// Mock de dayjs
jest.mock('@/lib/dayjs-config', () => ({
  __esModule: true,
  default: jest.fn(date => {
    const dateObj = new Date(date)
    const formatMap: { [key: string]: string } = {
      '2023-06-15T10:30:00.000Z': '15 juin 2023 à 10:30',
      '2023-07-20T14:15:00.000Z': '20 juil. 2023 à 14:15',
      '2023-08-10T09:00:00.000Z': '10 août 2023 à 09:00',
      '2023-06-16T10:30:00.000Z': '16 juin 2023 à 10:30',
      '2023-06-17T10:30:00.000Z': '17 juin 2023 à 10:30',
      '2023-06-18T10:30:00.000Z': '18 juin 2023 à 10:30',
      '2023-06-19T10:30:00.000Z': '19 juin 2023 à 10:30',
    }
    return {
      format: jest.fn(
        () => formatMap[dateObj.toISOString()] || '15 juin 2023 à 10:30'
      ),
    }
  }),
}))

// Mock des hooks
jest.mock('@/hooks/api/leave-balances/get-leave-balance-history')

const mockUseGetLeaveBalanceHistory = useGetLeaveBalanceHistory as jest.Mock

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

describe('MemberLeaveHistoryCard', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Historique des Congés')).toBeInTheDocument()
    // Pendant le chargement, aucun contenu d'historique ne devrait être affiché
    expect(
      screen.queryByText('Aucun historique de congés disponible.')
    ).not.toBeInTheDocument()
  })

  it('renders empty state correctly', () => {
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Historique des Congés')).toBeInTheDocument()
    expect(
      screen.getByText('Aucun historique de congés disponible.')
    ).toBeInTheDocument()
  })

  it('renders empty state when data is undefined', () => {
    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText('Aucun historique de congés disponible.')
    ).toBeInTheDocument()
  })

  it('renders history items correctly with positive change', () => {
    const mockHistory = [
      {
        id: '1',
        change: 5,
        reason: 'Ajout de congés annuels',
        createdAt: new Date('2023-06-15T10:30:00Z'),
        leaveBalance: {
          type: 'ANNUAL',
        },
        actor: {
          name: 'John Manager',
          email: 'john.manager@example.com',
        },
      },
    ]

    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockHistory,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés annuels')).toBeInTheDocument()
    expect(screen.getByText('+5 jours')).toBeInTheDocument()
    expect(
      screen.getByText('Motif: Ajout de congés annuels')
    ).toBeInTheDocument()
    expect(screen.getByText('15 juin 2023 à 10:30')).toBeInTheDocument()
    expect(screen.getByText('Par John Manager')).toBeInTheDocument()
  })

  it('renders history items correctly with negative change', () => {
    const mockHistory = [
      {
        id: '2',
        change: -3,
        reason: 'Congés pris',
        createdAt: new Date('2023-07-20T14:15:00Z'),
        leaveBalance: {
          type: 'SICK',
        },
        actor: {
          name: 'Jane Admin',
          email: 'jane.admin@example.com',
        },
      },
    ]

    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés maladie')).toBeInTheDocument()
    expect(screen.getByText('-3 jours')).toBeInTheDocument()
    expect(screen.getByText('Motif: Congés pris')).toBeInTheDocument()
    expect(screen.getByText('20 juil. 2023 à 14:15')).toBeInTheDocument()
    expect(screen.getByText('Par Jane Admin')).toBeInTheDocument()
  })

  it('renders history item with single day correctly', () => {
    const mockHistory = [
      {
        id: '3',
        change: 1,
        reason: null,
        createdAt: new Date('2023-08-10T09:00:00Z'),
        leaveBalance: {
          type: 'RTT',
        },
        actor: null,
      },
    ]

    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('RTT')).toBeInTheDocument()
    expect(screen.getByText('+1 jour')).toBeInTheDocument()
    expect(screen.queryByText('Motif:')).not.toBeInTheDocument()
    expect(screen.getByText('10 août 2023 à 09:00')).toBeInTheDocument()
    expect(screen.queryByText('Par')).not.toBeInTheDocument()
  })

  it('renders all leave types correctly', () => {
    const mockHistory = [
      {
        id: '1',
        change: 2,
        reason: null,
        createdAt: new Date('2023-06-15T10:30:00Z'),
        leaveBalance: { type: 'ANNUAL' },
        actor: null,
      },
      {
        id: '2',
        change: 1,
        reason: null,
        createdAt: new Date('2023-06-16T10:30:00Z'),
        leaveBalance: { type: 'SICK' },
        actor: null,
      },
      {
        id: '3',
        change: 1,
        reason: null,
        createdAt: new Date('2023-06-17T10:30:00Z'),
        leaveBalance: { type: 'PERSONAL' },
        actor: null,
      },
      {
        id: '4',
        change: 1,
        reason: null,
        createdAt: new Date('2023-06-18T10:30:00Z'),
        leaveBalance: { type: 'RTT' },
        actor: null,
      },
      {
        id: '5',
        change: 1,
        reason: null,
        createdAt: new Date('2023-06-19T10:30:00Z'),
        leaveBalance: { type: 'UNKNOWN_TYPE' },
        actor: null,
      },
    ]

    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés annuels')).toBeInTheDocument()
    expect(screen.getByText('Congés maladie')).toBeInTheDocument()
    expect(screen.getByText('Congés personnels')).toBeInTheDocument()
    expect(screen.getByText('RTT')).toBeInTheDocument()
    expect(screen.getByText('UNKNOWN_TYPE')).toBeInTheDocument()
  })

  it('renders actor with email when name is not available', () => {
    const mockHistory = [
      {
        id: '1',
        change: 2,
        reason: 'Test reason',
        createdAt: new Date('2023-06-15T10:30:00Z'),
        leaveBalance: { type: 'ANNUAL' },
        actor: {
          name: null,
          email: 'admin@example.com',
        },
      },
    ]

    mockUseGetLeaveBalanceHistory.mockReturnValue({
      data: mockHistory,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<MemberLeaveHistoryCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Par admin@example.com')).toBeInTheDocument()
  })
})
