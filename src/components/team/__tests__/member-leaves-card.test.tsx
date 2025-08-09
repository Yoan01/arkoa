import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { HalfDayPeriod } from '@/generated/prisma'
import { useGetMembershipLeaves } from '@/hooks/api/leaves/get-membership-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

import { MemberLeavesCard } from '../member-leaves-card'

// Mock des hooks
jest.mock('@/hooks/api/leaves/get-membership-leaves')
jest.mock('@/stores/use-company-store')

const mockUseGetMembershipLeaves = useGetMembershipLeaves as jest.Mock
const mockUseCompanyStore = jest.mocked(useCompanyStore)

// Mock des composants UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid='card' className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid='card-content' className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid='card-header' className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid='card-title' className={className}>
      {children}
    </h3>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid='skeleton' className={className} />
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid='badge' data-variant={variant}>
      {children}
    </span>
  ),
}))

// Mock des icônes
jest.mock('lucide-react', () => ({
  CalendarIcon: () => <div data-testid='calendar-icon' />,
  CheckCircleIcon: () => <div data-testid='check-circle-icon' />,
  XCircleIcon: () => <div data-testid='x-circle-icon' />,
  AlertCircleIcon: () => <div data-testid='alert-circle-icon' />,
  ClockIcon: () => <div data-testid='clock-icon' />,
}))

// Mock de dayjs
jest.mock('@/lib/dayjs-config', () => ({
  __esModule: true,
  default: jest.fn(_date => ({
    format: jest.fn(() => '15 Jan 2024'),
    diff: jest.fn(() => 2),
  })),
}))

// Mock des constantes
jest.mock('@/lib/constants', () => ({
  halfDayPeriodLabels: {
    MORNING: 'Matin',
    AFTERNOON: 'Après-midi',
  },
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

const mockLeaves = [
  {
    id: '1',
    type: 'ANNUAL',
    status: 'APPROVED',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17'),
    halfDayPeriod: null,
    reason: 'Vacances familiales',
    managerNote: 'Approuvé',
  },
  {
    id: '2',
    type: 'SICK',
    status: 'PENDING',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-20'),
    halfDayPeriod: HalfDayPeriod.MORNING,
    reason: 'Rendez-vous médical',
    managerNote: null,
  },
  {
    id: '3',
    type: 'PERSONAL',
    status: 'REJECTED',
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-01-25'),
    halfDayPeriod: null,
    reason: 'Congé personnel',
    managerNote: 'Non approuvé',
  },
]

describe('MemberLeavesCard', () => {
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
    mockUseGetMembershipLeaves.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés Récents')).toBeInTheDocument()
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6) // 3 items × 2 skeletons each
  })

  it("affiche un message d'erreur", () => {
    const error = new Error('Erreur de chargement')
    mockUseGetMembershipLeaves.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés Récents')).toBeInTheDocument()
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
  })

  it("affiche un message quand aucun congé n'est enregistré", () => {
    mockUseGetMembershipLeaves.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés Récents')).toBeInTheDocument()
    expect(screen.getByText('Aucun congé enregistré')).toBeInTheDocument()
  })

  it('affiche la liste des congés avec les bonnes informations', () => {
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Congés Récents')).toBeInTheDocument()
    expect(screen.getByText('Congés annuels')).toBeInTheDocument()
    expect(screen.getByText('Congés maladie')).toBeInTheDocument()
    expect(screen.getByText('Congés personnels')).toBeInTheDocument()
    expect(screen.getAllByText('Approuvé')).toHaveLength(2) // Badge + note manager
    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Rejeté')).toBeInTheDocument()
  })

  it('affiche les raisons et notes du manager', () => {
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Vacances familiales')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous médical')).toBeInTheDocument()
    expect(screen.getByText('Congé personnel')).toBeInTheDocument()
    expect(screen.getAllByText('Approuvé')).toHaveLength(2) // Badge + note manager
    expect(screen.getByText('Non approuvé')).toBeInTheDocument()
  })

  it("limite l'affichage à 5 congés et affiche un message pour les autres", () => {
    const manyLeaves = Array.from({ length: 7 }, (_, i) => ({
      id: `leave-${i + 1}`,
      type: 'ANNUAL',
      status: 'APPROVED',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-17'),
      halfDayPeriod: null,
      reason: `Congé ${i + 1}`,
      managerNote: null,
    }))

    mockUseGetMembershipLeaves.mockReturnValue({
      data: manyLeaves,
      isLoading: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Et 2 autres congés...')).toBeInTheDocument()
  })

  it("gère le cas où il n'y a pas de société active", () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    mockUseGetMembershipLeaves.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(mockUseGetMembershipLeaves).toHaveBeenCalledWith('', 'membership-1')
  })

  it('affiche les bonnes icônes selon le statut', () => {
    mockUseGetMembershipLeaves.mockReturnValue({
      data: mockLeaves,
      isLoading: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
  })

  it('formate correctement les demi-journées', () => {
    const halfDayLeave = {
      id: '1',
      type: 'SICK',
      status: 'APPROVED',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-15'),
      halfDayPeriod: HalfDayPeriod.MORNING,
      reason: 'Rendez-vous médical',
      managerNote: null,
    }

    mockUseGetMembershipLeaves.mockReturnValue({
      data: [halfDayLeave],
      isLoading: false,
      error: null,
    })

    render(<MemberLeavesCard membershipId='membership-1' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Demi-journée (Matin)')).toBeInTheDocument()
  })
})
