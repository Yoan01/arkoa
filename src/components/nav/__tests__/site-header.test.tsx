import { render, screen } from '@testing-library/react'

import { SiteHeader } from '../site-header'

// Mock next/navigation
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock des composants UI
jest.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className }: any) => (
    <div
      data-testid='separator'
      data-orientation={orientation}
      className={className}
    />
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: ({ className }: any) => (
    <button data-testid='sidebar-trigger' className={className} />
  ),
}))

// Mock des composants de dialogue
jest.mock('../../company/invite-user-dialog', () => ({
  InviteUserDialog: () => <div data-testid='invite-user-dialog' />,
}))

jest.mock('../../leaves/add-leave-dialog', () => ({
  AddLeaveDialog: () => <div data-testid='add-leave-dialog' />,
}))

// Mock des constantes
jest.mock('@/lib/constants', () => ({
  routeTitles: {
    '/dashboard': 'Tableau de bord',
    '/leaves': 'Congés',
    '/team': 'Équipe',
    '/company/settings': "Paramètres de l'entreprise",
    '/profile': 'Profil',
  },
}))

describe('SiteHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render header structure correctly', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('should display correct page title for dashboard', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Tableau de bord'
    )
  })

  it('should display correct page title for leaves', () => {
    mockUsePathname.mockReturnValue('/leaves')

    render(<SiteHeader />)

    expect(screen.getByText('Congés')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Congés'
    )
  })

  it('should display correct page title for team', () => {
    mockUsePathname.mockReturnValue('/team')

    render(<SiteHeader />)

    expect(screen.getByText('Équipe')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Équipe'
    )
  })

  it('should display default title for unknown routes', () => {
    mockUsePathname.mockReturnValue('/unknown-route')

    render(<SiteHeader />)

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Tableau de bord'
    )
  })

  it('should show AddLeaveDialog on leaves page', () => {
    mockUsePathname.mockReturnValue('/leaves')

    render(<SiteHeader />)

    expect(screen.getByTestId('add-leave-dialog')).toBeInTheDocument()
    expect(screen.queryByTestId('invite-user-dialog')).not.toBeInTheDocument()
  })

  it('should show InviteUserDialog on team page', () => {
    mockUsePathname.mockReturnValue('/team')

    render(<SiteHeader />)

    expect(screen.getByTestId('invite-user-dialog')).toBeInTheDocument()
    expect(screen.queryByTestId('add-leave-dialog')).not.toBeInTheDocument()
  })

  it('should not show any dialog on other pages', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    expect(screen.queryByTestId('add-leave-dialog')).not.toBeInTheDocument()
    expect(screen.queryByTestId('invite-user-dialog')).not.toBeInTheDocument()
  })

  it('should render separator with correct attributes', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
    expect(separator).toHaveClass(
      'mx-1 data-[orientation=vertical]:h-4 sm:mx-2'
    )
  })

  it('should render sidebar trigger with correct styling', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    const sidebarTrigger = screen.getByTestId('sidebar-trigger')
    expect(sidebarTrigger).toHaveClass('-ml-1')
  })

  it('should have proper header styling classes', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'
    )
  })

  it('should have proper content wrapper styling', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    const contentWrapper = screen.getByRole('banner').firstElementChild
    expect(contentWrapper).toHaveClass(
      'flex w-full items-center justify-between px-2 sm:px-4 lg:px-6'
    )
  })

  it('should have proper title styling', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toHaveClass('truncate text-sm font-medium sm:text-base')
  })

  it('should handle company settings route correctly', () => {
    mockUsePathname.mockReturnValue('/company/settings')

    render(<SiteHeader />)

    expect(screen.getByText("Paramètres de l'entreprise")).toBeInTheDocument()
    expect(screen.queryByTestId('add-leave-dialog')).not.toBeInTheDocument()
    expect(screen.queryByTestId('invite-user-dialog')).not.toBeInTheDocument()
  })

  it('should handle profile route correctly', () => {
    mockUsePathname.mockReturnValue('/profile')

    render(<SiteHeader />)

    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.queryByTestId('add-leave-dialog')).not.toBeInTheDocument()
    expect(screen.queryByTestId('invite-user-dialog')).not.toBeInTheDocument()
  })

  it('should render left section with navigation elements', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<SiteHeader />)

    const leftSection = screen
      .getByRole('banner')
      .querySelector('.flex.w-full.items-center.gap-1')
    expect(leftSection).toBeInTheDocument()
    expect(leftSection).toContainElement(screen.getByTestId('sidebar-trigger'))
    expect(leftSection).toContainElement(screen.getByTestId('separator'))
    expect(leftSection).toContainElement(
      screen.getByRole('heading', { level: 1 })
    )
  })

  it('should handle empty pathname gracefully', () => {
    mockUsePathname.mockReturnValue('')

    render(<SiteHeader />)

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
  })

  it('should handle null pathname gracefully', () => {
    mockUsePathname.mockReturnValue(null as any)

    render(<SiteHeader />)

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
  })
})
