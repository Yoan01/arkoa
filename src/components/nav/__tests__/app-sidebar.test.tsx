import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'

import { UserRole } from '@/generated/prisma'
import { useCompanyStore } from '@/stores/use-company-store'

import { AppSidebar } from '../app-sidebar'

// Mock des composants UI
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({
    children,
    ...props
  }: {
    children: ReactNode
    [key: string]: any
  }) => (
    <div data-testid='sidebar' {...props}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-content'>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-footer'>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-header'>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-menu'>{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-menu-item'>{children}</div>
  ),
}))

// Mock des composants nav
jest.mock('../nav-company', () => ({
  NavCompany: () => <div data-testid='nav-company'>NavCompany</div>,
}))

jest.mock('../nav-main', () => ({
  NavMain: ({ isManager }: { isManager: boolean }) => (
    <div data-testid='nav-main' data-is-manager={isManager}>
      NavMain
    </div>
  ),
}))

jest.mock('../nav-managers', () => ({
  NavManagers: () => <div data-testid='nav-managers'>NavManagers</div>,
}))

jest.mock('../nav-user', () => ({
  NavUser: () => <div data-testid='nav-user'>NavUser</div>,
}))

// Mock du store
jest.mock('@/stores/use-company-store')
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>

// Wrapper pour les tests
function TestWrapper({ children }: { children: ReactNode }) {
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

describe('AppSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render sidebar structure correctly', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    expect(screen.getByTestId('nav-company')).toBeInTheDocument()
    expect(screen.getByTestId('nav-user')).toBeInTheDocument()
  })

  it('should not render nav-main and nav-managers when no active company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    )

    expect(screen.queryByTestId('nav-main')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nav-managers')).not.toBeInTheDocument()
  })

  it('should render nav-main when active company exists with employee role', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: {
        id: '1',
        name: 'Test Company',
        userRole: UserRole.EMPLOYEE,
        logoUrl: null,
        annualLeaveDays: 25,
      },
      setActiveCompany: jest.fn(),
    })

    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    )

    const navMain = screen.getByTestId('nav-main')
    expect(navMain).toBeInTheDocument()
    expect(navMain).toHaveAttribute('data-is-manager', 'false')
    expect(screen.queryByTestId('nav-managers')).not.toBeInTheDocument()
  })

  it('should render nav-main and nav-managers when active company exists with manager role', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: {
        id: '1',
        name: 'Test Company',
        userRole: UserRole.MANAGER,
        logoUrl: null,
        annualLeaveDays: 25,
      },
      setActiveCompany: jest.fn(),
    })

    render(
      <TestWrapper>
        <AppSidebar />
      </TestWrapper>
    )

    const navMain = screen.getByTestId('nav-main')
    expect(navMain).toBeInTheDocument()
    expect(navMain).toHaveAttribute('data-is-manager', 'true')
    expect(screen.getByTestId('nav-managers')).toBeInTheDocument()
  })

  it('should pass props to Sidebar component', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: jest.fn(),
    })

    render(
      <TestWrapper>
        <AppSidebar className='custom-class' data-testprop='test' />
      </TestWrapper>
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('custom-class')
    expect(sidebar).toHaveAttribute('data-testprop', 'test')
  })
})
