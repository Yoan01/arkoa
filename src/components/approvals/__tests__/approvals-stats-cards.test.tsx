import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
// Mock ResizeObserver and IntersectionObserver
const mockIntersectionObserver = jest.fn()
const mockResizeObserver = jest.fn()

mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})

mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})

// Jest is used for testing
import { ApprovalsStatsCards } from '../approvals-stats-cards'

// Mock the actual modules
jest.mock('@/hooks/api/leaves/get-leave-stats', () => ({
  useGetLeaveStats: jest.fn(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: jest.fn(),
}))

// Import the mocked functions
import { useGetLeaveStats } from '@/hooks/api/leaves/get-leave-stats'
import { useCompanyStore } from '@/stores/use-company-store'
const mockUseGetLeaveStats = useGetLeaveStats as jest.MockedFunction<
  typeof useGetLeaveStats
>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid='check-circle-icon' className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <div data-testid='clock-icon' className={className} />
  ),
  XCircle: ({ className }: { className?: string }) => (
    <div data-testid='x-circle-icon' className={className} />
  ),
}))

const mockLeaveStats = {
  pendingLeaves: 5,
  approvedLeaves: 12,
  rejectedLeaves: 3,
}

const createMockQueryResult = (data: any) =>
  ({
    data,
    isLoading: false,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: true,
    status: 'success',
    fetchStatus: 'idle',
    isRefetching: false,
    isStale: false,
    isFetching: false,
    isFetchedAfterMount: true,
    isPlaceholderData: false,
    isPaused: false,
    refetch: jest.fn(),
    remove: jest.fn(),
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: true,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    promise: Promise.resolve(data),
  }) as any

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

Wrapper.displayName = 'Wrapper'

describe('ApprovalsStatsCards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.IntersectionObserver = mockIntersectionObserver as any
    global.ResizeObserver = mockResizeObserver as any
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render all stat cards with data', () => {
    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    // Check pending leaves card
    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument()

    // Check approved leaves card
    expect(screen.getByText('Approuvées')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()

    // Check rejected leaves card
    expect(screen.getByText('Rejetées')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
  })

  it('should render cards with undefined data', () => {
    mockUseGetLeaveStats.mockReturnValue(
      createMockQueryResult({
        pendingLeaves: undefined,
        approvedLeaves: undefined,
        rejectedLeaves: undefined,
      })
    )

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Approuvées')).toBeInTheDocument()
    expect(screen.getByText('Rejetées')).toBeInTheDocument()
  })

  it('should render cards with no data', () => {
    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(undefined))

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Approuvées')).toBeInTheDocument()
    expect(screen.getByText('Rejetées')).toBeInTheDocument()
  })

  it('should render cards with zero values', () => {
    mockUseGetLeaveStats.mockReturnValue(
      createMockQueryResult({
        pendingLeaves: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0,
      })
    )

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    const zeroValues = screen.getAllByText('0')
    expect(zeroValues).toHaveLength(3)
  })

  it('should have correct CSS classes for styling', () => {
    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    const { container } = render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    // Check grid layout
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid-cols-1 gap-4 md:grid-cols-3')

    // Check card styling
    const cards = container.querySelectorAll('[class*="shadow-sm"]')
    expect(cards).toHaveLength(3)
  })

  it('should have correct icon colors and backgrounds', () => {
    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    // Check pending (orange) icon
    const clockIcon = screen.getByTestId('clock-icon')
    expect(clockIcon).toHaveClass('h-6 w-6 text-orange-500')

    // Check approved (green) icon
    const checkIcon = screen.getByTestId('check-circle-icon')
    expect(checkIcon).toHaveClass('h-6 w-6 text-green-500')

    // Check rejected (red) icon
    const xIcon = screen.getByTestId('x-circle-icon')
    expect(xIcon).toHaveClass('h-6 w-6 text-red-500')
  })

  it('should handle missing company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
    })

    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    expect(screen.getByText('En attente')).toBeInTheDocument()
    expect(screen.getByText('Approuvées')).toBeInTheDocument()
    expect(screen.getByText('Rejetées')).toBeInTheDocument()
  })

  it('should call useGetLeaveStats with correct company ID', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'test-company-id', name: 'Test Company' },
    })

    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    expect(mockUseGetLeaveStats).toHaveBeenCalledWith({
      companyId: 'test-company-id',
    })
  })

  it('should call useGetLeaveStats with empty string when no company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
    })

    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    expect(mockUseGetLeaveStats).toHaveBeenCalledWith({
      companyId: '',
    })
  })

  it('should render cards in correct order', () => {
    mockUseGetLeaveStats.mockReturnValue(createMockQueryResult(mockLeaveStats))

    const { container } = render(
      <Wrapper>
        <ApprovalsStatsCards />
      </Wrapper>
    )

    const cards = container.querySelectorAll('[class*="shadow-sm"]')
    expect(cards[0]).toHaveTextContent('En attente')
    expect(cards[1]).toHaveTextContent('Approuvées')
    expect(cards[2]).toHaveTextContent('Rejetées')
  })
})
