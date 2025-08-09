import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { MemberLeavesTabs } from '../member-leaves-tabs'

// Mock des composants enfants
jest.mock('../member-leaves-card', () => ({
  MemberLeavesCard: ({ membershipId }: { membershipId: string }) => (
    <div data-testid='member-leaves-card'>
      Member Leaves Card - {membershipId || ''}
    </div>
  ),
}))

jest.mock('../member-leave-history-card', () => ({
  MemberLeaveHistoryCard: ({ membershipId }: { membershipId: string }) => (
    <div data-testid='member-leave-history-card'>
      Member Leave History Card - {membershipId || ''}
    </div>
  ),
}))

// Mock des composants UI
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, className }: any) => (
    <div
      data-testid='tabs'
      data-default-value={defaultValue}
      className={className}
    >
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid='tabs-list' className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className, ...props }: any) => (
    <button
      data-testid={`tabs-trigger-${value}`}
      data-value={value}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div
      data-testid={`tabs-content-${value}`}
      data-value={value}
      className={className}
    >
      {children}
    </div>
  ),
}))

// Mock des icônes
jest.mock('lucide-react', () => ({
  CalendarIcon: () => <div data-testid='calendar-icon' />,
  HistoryIcon: () => <div data-testid='history-icon' />,
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

describe('MemberLeavesTabs', () => {
  const membershipId = 'membership-123'

  it('rend le composant avec les onglets par défaut', () => {
    render(<MemberLeavesTabs membershipId={membershipId} />, {
      wrapper: createWrapper(),
    })

    // Vérifie que le conteneur principal est rendu
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
    expect(screen.getByTestId('tabs')).toHaveAttribute(
      'data-default-value',
      'leaves'
    )
    expect(screen.getByTestId('tabs')).toHaveClass('w-full')

    // Vérifie que la liste des onglets est rendue
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    expect(screen.getByTestId('tabs-list')).toHaveClass(
      'grid w-full grid-cols-2'
    )
  })

  it('affiche les deux onglets avec les bonnes icônes et textes', () => {
    render(<MemberLeavesTabs membershipId={membershipId} />, {
      wrapper: createWrapper(),
    })

    // Vérifie l'onglet "Congés Récents"
    const leavesTab = screen.getByTestId('tabs-trigger-leaves')
    expect(leavesTab).toBeInTheDocument()
    expect(leavesTab).toHaveAttribute('data-value', 'leaves')
    expect(leavesTab).toHaveClass('flex items-center gap-2')
    expect(screen.getByText('Congés Récents')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()

    // Vérifie l'onglet "Historique"
    const historyTab = screen.getByTestId('tabs-trigger-history')
    expect(historyTab).toBeInTheDocument()
    expect(historyTab).toHaveAttribute('data-value', 'history')
    expect(historyTab).toHaveClass('flex items-center gap-2')
    expect(screen.getByText('Historique')).toBeInTheDocument()
    expect(screen.getByTestId('history-icon')).toBeInTheDocument()
  })

  it('affiche le contenu des onglets avec les bons composants', () => {
    render(<MemberLeavesTabs membershipId={membershipId} />, {
      wrapper: createWrapper(),
    })

    // Vérifie le contenu de l'onglet "leaves"
    const leavesContent = screen.getByTestId('tabs-content-leaves')
    expect(leavesContent).toBeInTheDocument()
    expect(leavesContent).toHaveAttribute('data-value', 'leaves')
    expect(leavesContent).toHaveClass('mt-6')
    expect(screen.getByTestId('member-leaves-card')).toBeInTheDocument()
    expect(
      screen.getByText(`Member Leaves Card - ${membershipId}`)
    ).toBeInTheDocument()

    // Vérifie le contenu de l'onglet "history"
    const historyContent = screen.getByTestId('tabs-content-history')
    expect(historyContent).toBeInTheDocument()
    expect(historyContent).toHaveAttribute('data-value', 'history')
    expect(historyContent).toHaveClass('mt-6')
    expect(screen.getByTestId('member-leave-history-card')).toBeInTheDocument()
    expect(
      screen.getByText(`Member Leave History Card - ${membershipId}`)
    ).toBeInTheDocument()
  })

  it('passe le membershipId correct aux composants enfants', () => {
    const testMembershipId = 'test-membership-456'

    render(<MemberLeavesTabs membershipId={testMembershipId} />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText(`Member Leaves Card - ${testMembershipId}`)
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Member Leave History Card - ${testMembershipId}`)
    ).toBeInTheDocument()
  })

  it('a la structure HTML correcte pour les onglets', () => {
    render(<MemberLeavesTabs membershipId={membershipId} />, {
      wrapper: createWrapper(),
    })

    // Vérifie que les onglets sont des boutons
    const leavesTab = screen.getByTestId('tabs-trigger-leaves')
    const historyTab = screen.getByTestId('tabs-trigger-history')

    expect(leavesTab.tagName).toBe('BUTTON')
    expect(historyTab.tagName).toBe('BUTTON')
  })

  it("peut être cliqué sur les onglets (test d'interaction de base)", () => {
    render(<MemberLeavesTabs membershipId={membershipId} />, {
      wrapper: createWrapper(),
    })

    const leavesTab = screen.getByTestId('tabs-trigger-leaves')
    const historyTab = screen.getByTestId('tabs-trigger-history')

    // Teste que les onglets peuvent être cliqués sans erreur
    expect(() => {
      fireEvent.click(leavesTab)
      fireEvent.click(historyTab)
    }).not.toThrow()
  })

  it('rend avec un membershipId vide', () => {
    render(<MemberLeavesTabs membershipId='' />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText(/Member Leaves Card -/)).toBeInTheDocument()
    expect(screen.getByText(/Member Leave History Card -/)).toBeInTheDocument()
  })

  it('maintient la structure des classes CSS', () => {
    render(<MemberLeavesTabs membershipId={membershipId} />, {
      wrapper: createWrapper(),
    })

    // Vérifie les classes CSS importantes
    expect(screen.getByTestId('tabs')).toHaveClass('w-full')
    expect(screen.getByTestId('tabs-list')).toHaveClass('grid')
    expect(screen.getByTestId('tabs-list')).toHaveClass('w-full')
    expect(screen.getByTestId('tabs-list')).toHaveClass('grid-cols-2')
    expect(screen.getByTestId('tabs-trigger-leaves')).toHaveClass('flex')
    expect(screen.getByTestId('tabs-trigger-leaves')).toHaveClass(
      'items-center'
    )
    expect(screen.getByTestId('tabs-trigger-leaves')).toHaveClass('gap-2')
    expect(screen.getByTestId('tabs-trigger-history')).toHaveClass('flex')
    expect(screen.getByTestId('tabs-trigger-history')).toHaveClass(
      'items-center'
    )
    expect(screen.getByTestId('tabs-trigger-history')).toHaveClass('gap-2')
    expect(screen.getByTestId('tabs-content-leaves')).toHaveClass('mt-6')
    expect(screen.getByTestId('tabs-content-history')).toHaveClass('mt-6')
  })
})
