import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'

import { NavManagers } from '../nav-managers'

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
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-group-label'>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-menu'>{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    tooltip,
    asChild,
    isActive,
    className,
    ...props
  }: any) => {
    const Component = asChild ? 'div' : 'button'
    return (
      <Component
        data-testid='sidebar-menu-button'
        data-tooltip={tooltip}
        data-active={isActive}
        className={className}
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

// Mock lucide-react
jest.mock('lucide-react', () => ({
  MoreHorizontalIcon: ({ className, ...props }: any) => (
    <div data-testid='more-horizontal-icon' className={className} {...props} />
  ),
}))

// Mock des constantes
jest.mock('@/lib/constants', () => ({
  appSidebarManager: [
    {
      title: 'Company Settings',
      url: '/company/settings',
      icon: () => <div data-testid='company-settings-icon' />,
    },
    {
      title: 'User Management',
      url: '/company/users',
      icon: () => <div data-testid='user-management-icon' />,
    },
    {
      title: 'Reports',
      url: '/company/reports',
      icon: () => <div data-testid='reports-icon' />,
    },
  ],
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
Wrapper.displayName = 'Wrapper'

describe('NavManagers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/company/settings')
  })

  it('should render administration section label', () => {
    render(<NavManagers />)

    expect(screen.getByTestId('sidebar-group-label')).toBeInTheDocument()
    expect(screen.getByText('Administration')).toBeInTheDocument()
  })

  it('should render all manager navigation items', () => {
    render(<NavManagers />)

    expect(screen.getByText('Company Settings')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()

    expect(screen.getByTestId('company-settings-icon')).toBeInTheDocument()
    expect(screen.getByTestId('user-management-icon')).toBeInTheDocument()
    expect(screen.getByTestId('reports-icon')).toBeInTheDocument()
  })

  it('should render More button with proper styling', () => {
    render(<NavManagers />)

    const moreButton = screen.getByText('More')
    expect(moreButton).toBeInTheDocument()

    const moreIcon = screen.getByTestId('more-horizontal-icon')
    expect(moreIcon).toBeInTheDocument()
    expect(moreIcon).toHaveClass('text-sidebar-foreground/70')

    const moreMenuButton = moreButton.closest(
      '[data-testid="sidebar-menu-button"]'
    )
    expect(moreMenuButton).toHaveClass('text-sidebar-foreground/70')
  })

  it('should mark active menu item based on pathname', () => {
    mockUsePathname.mockReturnValue('/company/users')

    render(<NavManagers />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    // Find the user management button (should be active)
    const userManagementButton = menuButtons.find(button =>
      button.textContent?.includes('User Management')
    )
    expect(userManagementButton).toHaveAttribute('data-active', 'true')

    // Other buttons should not be active
    const companySettingsButton = menuButtons.find(button =>
      button.textContent?.includes('Company Settings')
    )
    expect(companySettingsButton).toHaveAttribute('data-active', 'false')
  })

  it('should render proper link structure', () => {
    render(<NavManagers />)

    const companySettingsLink = screen.getByRole('link', {
      name: /company settings/i,
    })
    const userManagementLink = screen.getByRole('link', {
      name: /user management/i,
    })
    const reportsLink = screen.getByRole('link', { name: /reports/i })

    expect(companySettingsLink).toHaveAttribute('href', '/company/settings')
    expect(userManagementLink).toHaveAttribute('href', '/company/users')
    expect(reportsLink).toHaveAttribute('href', '/company/reports')
  })

  it('should have proper tooltip attributes', () => {
    render(<NavManagers />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    const companySettingsButton = menuButtons.find(button =>
      button.textContent?.includes('Company Settings')
    )
    expect(companySettingsButton).toHaveAttribute(
      'data-tooltip',
      'Company Settings'
    )

    const userManagementButton = menuButtons.find(button =>
      button.textContent?.includes('User Management')
    )
    expect(userManagementButton).toHaveAttribute(
      'data-tooltip',
      'User Management'
    )

    const reportsButton = menuButtons.find(button =>
      button.textContent?.includes('Reports')
    )
    expect(reportsButton).toHaveAttribute('data-tooltip', 'Reports')
  })

  it('should render sidebar structure correctly', () => {
    render(<NavManagers />)

    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-group-label')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
    expect(screen.getAllByTestId('sidebar-menu-item')).toHaveLength(4) // 3 nav items + 1 more button
  })

  it('should handle different pathname scenarios', () => {
    mockUsePathname.mockReturnValue('/unknown-path')

    render(<NavManagers />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    // No navigation button should be active for unknown path (excluding More button)
    const navButtons = menuButtons.filter(
      button => button.textContent && !button.textContent.includes('More')
    )

    navButtons.forEach(button => {
      expect(button).toHaveAttribute('data-active', 'false')
    })
  })

  it('should handle exact pathname matching', () => {
    mockUsePathname.mockReturnValue('/company/settings')

    render(<NavManagers />)

    const menuButtons = screen.getAllByTestId('sidebar-menu-button')

    const companySettingsButton = menuButtons.find(button =>
      button.textContent?.includes('Company Settings')
    )
    expect(companySettingsButton).toHaveAttribute('data-active', 'true')

    const userManagementButton = menuButtons.find(button =>
      button.textContent?.includes('User Management')
    )
    expect(userManagementButton).toHaveAttribute('data-active', 'false')
  })

  it('should render all menu items with icons and text', () => {
    render(<NavManagers />)

    // Check that each menu item has both icon and text
    const companySettingsItem = screen
      .getByText('Company Settings')
      .closest('[data-testid="sidebar-menu-item"]')
    expect(companySettingsItem).toContainElement(
      screen.getByTestId('company-settings-icon')
    )
    expect(companySettingsItem).toContainElement(
      screen.getByText('Company Settings')
    )

    const userManagementItem = screen
      .getByText('User Management')
      .closest('[data-testid="sidebar-menu-item"]')
    expect(userManagementItem).toContainElement(
      screen.getByTestId('user-management-icon')
    )
    expect(userManagementItem).toContainElement(
      screen.getByText('User Management')
    )

    const reportsItem = screen
      .getByText('Reports')
      .closest('[data-testid="sidebar-menu-item"]')
    expect(reportsItem).toContainElement(screen.getByTestId('reports-icon'))
    expect(reportsItem).toContainElement(screen.getByText('Reports'))
  })
})
