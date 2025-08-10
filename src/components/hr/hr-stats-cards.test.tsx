import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

// Mock des hooks
import { useGetCompanyStats } from '@/hooks/api/companies/get-company-stats'
import { useCompanyStore } from '@/stores/use-company-store'

import { HrStatsCards } from './hr-stats-cards'

jest.mock('@/hooks/api/companies/get-company-stats', () => ({
  useGetCompanyStats: jest.fn(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: jest.fn(),
}))

const mockUseGetCompanyStats = useGetCompanyStats as jest.MockedFunction<any>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<any>

const mockStats = {
  totalEmployees: 25,
  employeesOnLeave: 3,
  pendingRequests: 5,
  averageLeaveBalance: 18.5,
}

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

const mockCompanyStore = {
  activeCompany: {
    id: 'company-1',
    name: 'Test Company',
  },
}

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

describe('HrStatsCards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(mockStats))
    mockUseCompanyStore.mockReturnValue(mockCompanyStore)
  })

  it('devrait afficher les statistiques correctement', () => {
    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(mockStats))

    renderWithQueryClient(<HrStatsCards />)

    expect(screen.getByText('Total Employés')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Employés actifs')).toBeInTheDocument()

    expect(screen.getByText('En Congé')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Actuellement absents')).toBeInTheDocument()

    expect(screen.getByText('Demandes en Attente')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('À traiter')).toBeInTheDocument()

    expect(screen.getByText('Solde Moyen')).toBeInTheDocument()
    expect(screen.getByText('18.5')).toBeInTheDocument()
    expect(screen.getByText('Jours de congés payés')).toBeInTheDocument()
  })

  it('devrait afficher un état de chargement', () => {
    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(null, true))

    renderWithQueryClient(<HrStatsCards />)

    // Vérifier qu'il y a 4 cartes de chargement
    const loadingCards = screen
      .getAllByRole('generic')
      .filter(el => el.className.includes('animate-pulse'))
    expect(loadingCards.length).toBeGreaterThan(0)
  })

  it("devrait afficher un message d'erreur", () => {
    mockUseGetCompanyStats.mockReturnValue(
      createMockQueryResult(null, false, new Error('Erreur de chargement'))
    )

    renderWithQueryClient(<HrStatsCards />)

    expect(
      screen.getByText('Erreur lors du chargement des statistiques')
    ).toBeInTheDocument()
  })

  it('ne devrait rien afficher si data est null et pas de chargement/erreur', () => {
    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(null))

    const { container } = renderWithQueryClient(<HrStatsCards />)

    expect(container.firstChild).toBeNull()
  })

  it("devrait appeler useGetCompanyStats avec l'ID de l'entreprise active", () => {
    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(mockStats))

    renderWithQueryClient(<HrStatsCards />)

    expect(mockUseGetCompanyStats).toHaveBeenCalledWith('company-1')
  })

  it("devrait appeler useGetCompanyStats avec undefined quand il n'y a pas d'entreprise active", () => {
    mockUseCompanyStore.mockReturnValue({ activeCompany: null })
    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(null))

    renderWithQueryClient(<HrStatsCards />)

    expect(mockUseGetCompanyStats).toHaveBeenCalledWith(undefined)
  })

  it('devrait avoir la bonne structure de grille responsive', () => {
    mockUseGetCompanyStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<HrStatsCards />)

    const gridContainer = screen.getByText('Total Employés').closest('.grid')
    expect(gridContainer).toHaveClass('grid-cols-1')
    expect(gridContainer).toHaveClass('gap-4')
    expect(gridContainer).toHaveClass('md:grid-cols-2')
    expect(gridContainer).toHaveClass('lg:grid-cols-4')
  })

  it('devrait afficher les icônes appropriées', () => {
    mockUseGetCompanyStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    const { container } = renderWithQueryClient(<HrStatsCards />)

    // Vérifier la présence des icônes par leurs classes CSS
    expect(container.querySelector('.text-blue-500')).toBeInTheDocument() // UsersIcon
    expect(container.querySelector('.text-orange-400')).toBeInTheDocument() // ClockIcon
    expect(container.querySelector('.text-purple-500')).toBeInTheDocument() // TrendingUpIcon
  })

  it('devrait avoir les bonnes couleurs pour les valeurs', () => {
    mockUseGetCompanyStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    renderWithQueryClient(<HrStatsCards />)

    expect(screen.getByText('25')).toHaveClass('text-blue-600')
    expect(screen.getByText('3')).toHaveClass('text-primary')
    expect(screen.getByText('5')).toHaveClass('text-orange-500')
    expect(screen.getByText('18.5')).toHaveClass('text-purple-600')
  })

  it('devrait avoir des effets de hover sur les cartes', () => {
    mockUseGetCompanyStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    const { container } = renderWithQueryClient(<HrStatsCards />)

    const cards = container.querySelectorAll('.shadow-sm')
    expect(cards.length).toBeGreaterThan(0)

    cards.forEach(card => {
      expect(card).toHaveClass('transition-shadow')
      expect(card).toHaveClass('hover:shadow-md')
    })
  })

  it('devrait gérer les statistiques avec des valeurs à zéro', () => {
    const zeroStats = {
      totalEmployees: 0,
      employeesOnLeave: 0,
      pendingRequests: 0,
      averageLeaveBalance: 0,
    }

    mockUseGetCompanyStats.mockReturnValue(createMockQueryResult(zeroStats))

    renderWithQueryClient(<HrStatsCards />)

    expect(screen.getAllByText('0')).toHaveLength(4)
  })
})
