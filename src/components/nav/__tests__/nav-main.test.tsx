import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'

import { NavMain } from '../nav-main'

// Mock Next.js
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock des composants UI
jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-group'>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-group-content'>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-menu'>{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    tooltip,
    asChild,
    isActive,
    ...props
  }: any) => {
    const Component = asChild ? 'div' : 'button'
    return (
      <Component
        data-testid='sidebar-menu-button'
        data-tooltip={tooltip}
        data-active={isActive}
        {...props}
      >
        {children}
      </Component>
    )
  },
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-menu-item'>{children}</div>
  ),
}))

// Mock des composants de dialogue
jest.mock('../../company/invite-user-dialog', () => ({
  InviteUserDialog: ({ trigger }: { trigger: ReactNode }) => (
    <div data-testid='invite-user-dialog'>{trigger}</div>
  ),
}))

jest.mock('../../leaves/add-leave-dialog', () => ({
  AddLeaveDialog: ({ trigger }: { trigger: ReactNode }) => (
    <div data-testid='add-leave-dialog'>{trigger}</div>
  ),
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  PlusCircleIcon: (props: any) => (
    <div data-testid='plus-circle-icon' {...props} />
  ),
}))

// Mock des constantes
jest.mock('@/lib/constants', () => ({
  appSidebarNav: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: () => <div data-testid='dashboard-icon' />,
    },
    {
      title: 'Leaves',
      url: '/leaves',
      icon: () => <div data-testid='leaves-icon' />,
    },
    {
      title: 'Team',
      url: '/team',
      icon: () => <div data-testid='team-icon' />,
    },
  ],
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
Wrapper.displayName = 'Wrapper'

describe('NavMain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('should render invite user dialog for managers', () => {
    render(<NavMain isManager={true} />)

    expect(screen.getByTestId('invite-user-dialog')).toBeInTheDocument()
    expect(screen.queryByTestId('add-leave-dialog')).not.toBeInTheDocument()

    const inviteButton = screen.getByText('Inviter un membre')
    expect(inviteButton).toBeInTheDocument()
    expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument()
  })

  it('should render add leave dialog for employees', () => {
    render(<NavMain isManager={false} />)

    expect(screen.getByTestId('add-leave-dialog')).toBeInTheDocument()
    expect(screen.queryByTestId('invite-user-dialog')).not.toBeInTheDocument()

    const addLeaveButton = screen.getByText('Nouvelle demande')
    expect(addLeaveButton).toBeInTheDocument()
    expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument()
  })

  it('should render navigation menu items', () => {
    render(<NavMain isManager={true} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leaves')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()

    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument()
    expect(screen.getByTestId('leaves-icon')).toBeInTheDocument()
    expect(screen.getByTestId('team-icon')).toBeInTheDocument()
  })

  it('should mark active menu item based on pathname', () => {
    mockUsePathname.mockReturnValue('/leaves')

    render(<NavMain isManager={true} />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    // Find the leaves menu button (should be active)
    const leavesButton = menuButtons.find(button =>
      button.textContent?.includes('Leaves')
    )
    expect(leavesButton).toHaveAttribute('data-active', 'true')

    // Other buttons should not be active
    const dashboardButton = menuButtons.find(button =>
      button.textContent?.includes('Dashboard')
    )
    expect(dashboardButton).toHaveAttribute('data-active', 'false')
  })

  it('should render proper link structure', () => {
    render(<NavMain isManager={true} />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const leavesLink = screen.getByRole('link', { name: /leaves/i })
    const teamLink = screen.getByRole('link', { name: /team/i })

    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(leavesLink).toHaveAttribute('href', '/leaves')
    expect(teamLink).toHaveAttribute('href', '/team')
  })

  it('should have proper tooltip attributes', () => {
    render(<NavMain isManager={true} />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    const inviteButton = menuButtons.find(button =>
      button.textContent?.includes('Inviter un membre')
    )
    expect(inviteButton).toHaveAttribute('data-tooltip', 'Inviter un membre')

    const dashboardButton = menuButtons.find(button =>
      button.textContent?.includes('Dashboard')
    )
    expect(dashboardButton).toHaveAttribute('data-tooltip', 'Dashboard')
  })

  it('should render sidebar structure correctly', () => {
    render(<NavMain isManager={true} />)

    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-group-content')).toBeInTheDocument()
    expect(screen.getAllByTestId('sidebar-menu')).toHaveLength(2) // One for action button, one for nav items
    expect(screen.getAllByTestId('sidebar-menu-item')).toHaveLength(4) // 1 action + 3 nav items
  })

  it('should handle different pathname scenarios', () => {
    mockUsePathname.mockReturnValue('/unknown-path')

    render(<NavMain isManager={true} />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    // No button should be active for unknown path
    const navButtons = menuButtons.filter(
      button => button.textContent && !button.textContent.includes('Inviter')
    )

    navButtons.forEach(button => {
      expect(button).toHaveAttribute('data-active', 'false')
    })
  })
})
