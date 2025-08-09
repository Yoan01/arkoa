import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { toast } from 'sonner'

import { UserRole } from '@/generated/prisma'
import { useDeleteCompany } from '@/hooks/api/companies/delete-company'
import { useGetCompanies } from '@/hooks/api/companies/get-companies'
import { useSession } from '@/lib/auth-client'
import { useCompanyStore } from '@/stores/use-company-store'

import { NavCompany } from '../nav-company'

// Mock des hooks
jest.mock('@/hooks/api/companies/get-companies')
jest.mock('@/hooks/api/companies/delete-company')
// Mock auth-client completely
jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
  authClient: {
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
  },
}))
jest.mock('@/stores/use-company-store')
jest.mock('sonner')

// Mock des composants UI
jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
  useSidebar: () => ({ state: 'expanded', isMobile: false }),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, onOpenChange }: any) => (
    <div data-testid='dropdown-menu' onClick={() => onOpenChange?.(true)}>
      {children}
    </div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid='dropdown-content'>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid='dropdown-item' onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => (
    <div data-testid='dropdown-label'>{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid='dropdown-separator' />,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/logo', () => ({
  Logo: ({ logoUrl, className }: any) => (
    <div data-testid='logo' data-logo-url={logoUrl} className={className} />
  ),
}))

jest.mock('../../company/add-company-dialog', () => ({
  AddCompanyDialog: ({ company }: any) => (
    <div data-testid='add-company-dialog' data-company-id={company?.id} />
  ),
}))

jest.mock('../../ui/dialog-action', () => ({
  DialogAction: ({ children, onClick }: any) => (
    <div data-testid='dialog-action' onClick={onClick}>
      {children}
    </div>
  ),
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronsUpDownIcon: (props: any) => (
    <div data-testid='chevrons-up-down' {...props} />
  ),
  Trash2Icon: (props: any) => <div data-testid='trash-icon' {...props} />,
}))

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

const mockUseGetCompanies = useGetCompanies as jest.MockedFunction<
  typeof useGetCompanies
>
const mockUseDeleteCompany = useDeleteCompany as jest.MockedFunction<
  typeof useDeleteCompany
>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>
const _mockToast = toast as jest.Mocked<typeof toast>

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

describe('NavCompany', () => {
  const mockSetActiveCompany = jest.fn()
  const mockMutateAsync = jest.fn()

  const mockCompanies = [
    {
      id: '1',
      name: 'Company 1',
      logoUrl: 'logo1.png',
      userRole: UserRole.MANAGER,
      annualLeaveDays: 25,
    },
    {
      id: '2',
      name: 'Company 2',
      logoUrl: null,
      userRole: UserRole.EMPLOYEE,
      annualLeaveDays: 25,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseCompanyStore.mockReturnValue({
      activeCompany: mockCompanies[0],
      setActiveCompany: mockSetActiveCompany,
    })

    mockUseGetCompanies.mockReturnValue({
      data: mockCompanies,
      isFetching: false,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any)

    mockUseDeleteCompany.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)

    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    } as any)
  })

  it('should render company selector with active company', () => {
    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    expect(screen.getAllByText('Company 1')).toHaveLength(2) // One in trigger, one in dropdown
    const logos = screen.getAllByTestId('logo')
    expect(logos[0]).toHaveAttribute('data-logo-url', 'logo1.png')
    expect(screen.getByTestId('chevrons-up-down')).toBeInTheDocument()
  })

  it('should render "Ajouter entreprise" when no active company', () => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: null,
      setActiveCompany: mockSetActiveCompany,
    })

    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    expect(screen.getByText('Ajouter entreprise')).toBeInTheDocument()
  })

  it('should open dropdown and show companies list', async () => {
    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    const dropdownMenu = screen.getByTestId('dropdown-menu')
    fireEvent.click(dropdownMenu)

    await waitFor(() => {
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
      expect(screen.getByText('Entreprise')).toBeInTheDocument()
    })
  })

  it('should switch active company when clicking on different company', async () => {
    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    const dropdownMenu = screen.getByTestId('dropdown-menu')
    fireEvent.click(dropdownMenu)

    await waitFor(() => {
      const companyItems = screen.getAllByTestId('dropdown-item')
      fireEvent.click(companyItems[1]) // Click on second company
    })

    expect(mockSetActiveCompany).toHaveBeenCalledWith(mockCompanies[1])
  })

  it('should not switch company if clicking on already active company', async () => {
    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    const dropdownMenu = screen.getByTestId('dropdown-menu')
    fireEvent.click(dropdownMenu)

    await waitFor(() => {
      const companyItems = screen.getAllByTestId('dropdown-item')
      fireEvent.click(companyItems[0]) // Click on active company
    })

    expect(mockSetActiveCompany).not.toHaveBeenCalled()
  })

  it('should show delete button only for manager role', async () => {
    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    const dropdownMenu = screen.getByTestId('dropdown-menu')
    fireEvent.click(dropdownMenu)

    await waitFor(() => {
      const addCompanyDialogs = screen.getAllByTestId('add-company-dialog')
      const dialogActions = screen.getAllByTestId('dialog-action')

      // Manager company should have both edit and delete
      expect(addCompanyDialogs[0]).toHaveAttribute('data-company-id', '1')
      expect(dialogActions[0]).toBeInTheDocument()

      // Employee company should not have edit/delete buttons
      expect(addCompanyDialogs).toHaveLength(2) // One for manager company, one for add new
    })
  })

  it('should handle company deletion', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    const dropdownMenu = screen.getByTestId('dropdown-menu')
    fireEvent.click(dropdownMenu)

    await waitFor(async () => {
      const dialogAction = screen.getAllByTestId('dialog-action')[0]
      await user.click(dialogAction)
    })

    expect(mockMutateAsync).toHaveBeenCalledWith(
      { companyId: '1' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    )
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TestWrapper>
        <NavCompany className='custom-class' />
      </TestWrapper>
    )

    const navCompany = container.querySelector('.custom-class')
    expect(navCompany).toBeInTheDocument()
  })

  it('should set active company to null when no companies available', () => {
    mockUseGetCompanies.mockReturnValue({
      data: [],
      isFetching: false,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any)

    render(
      <TestWrapper>
        <NavCompany />
      </TestWrapper>
    )

    const dropdownMenu = screen.getByTestId('dropdown-menu')
    fireEvent.click(dropdownMenu)

    expect(mockSetActiveCompany).toHaveBeenCalledWith(null)
  })
})
