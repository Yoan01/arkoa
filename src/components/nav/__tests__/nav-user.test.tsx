import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Image from 'next/image'
import React from 'react'

import { NavUser } from '../nav-user'

// Mock next/navigation
const mockUseRouter = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}))

// Mock auth-client completely
jest.mock('@/lib/auth-client', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
  authClient: {
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
  },
}))

// Mock des composants UI
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => (
    <div data-testid='avatar' className={className}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children, className }: any) => (
    <div data-testid='avatar-fallback' className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) => (
    <Image
      data-testid='avatar-image'
      src={src}
      alt={alt}
      width={32}
      height={32}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid='dropdown-menu'>{children}</div>
  ),
  DropdownMenuContent: ({ children, side, align }: any) => (
    <div data-testid='dropdown-content' data-side={side} data-align={align}>
      {children}
    </div>
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
  DropdownMenuGroup: ({ children }: any) => (
    <div data-testid='dropdown-group'>{children}</div>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: any) => (
    <div data-testid='sidebar-menu'>{children}</div>
  ),
  SidebarMenuButton: ({ children, size, className, ...props }: any) => (
    <button
      data-testid='sidebar-menu-button'
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: any) => (
    <div data-testid='sidebar-menu-item'>{children}</div>
  ),
  useSidebar: () => ({ isMobile: false }),
}))

// Mock FeatureComingSoonDialog
jest.mock('@/components/ui/feature-coming-soon-dialog', () => ({
  FeatureComingSoonDialog: ({ open, onOpenChange, featureName }: any) => (
    <div
      data-testid='feature-coming-soon-dialog'
      data-open={open}
      data-feature-name={featureName}
      onClick={() => onOpenChange(false)}
    >
      Feature Coming Soon: {featureName}
    </div>
  ),
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  BellIcon: (props: any) => <div data-testid='bell-icon' {...props} />,
  CreditCardIcon: (props: any) => (
    <div data-testid='credit-card-icon' {...props} />
  ),
  LogOutIcon: (props: any) => <div data-testid='logout-icon' {...props} />,
  MoreVerticalIcon: (props: any) => (
    <div data-testid='more-vertical-icon' {...props} />
  ),
  UserCircleIcon: (props: any) => (
    <div data-testid='user-circle-icon' {...props} />
  ),
}))

// Mock auth-client
jest.mock('@/lib/auth-client', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}))

const { signOut: mockedSignOut, useSession: mockedUseSession } =
  jest.requireMock('@/lib/auth-client')

describe('NavUser', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: 'https://example.com/avatar.jpg',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    mockedUseSession.mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
    } as any)
  })

  it('should render null when no user session', () => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any)

    const { container } = render(<NavUser />)
    expect(container.firstChild).toBeNull()
  })

  it('should render user information when authenticated', () => {
    render(<NavUser />)

    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-menu-item')).toBeInTheDocument()
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()

    expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    expect(screen.getAllByText('john.doe@example.com')[0]).toBeInTheDocument()
  })

  it('should render user avatar with image', () => {
    render(<NavUser />)

    const avatarImages = screen.getAllByTestId('avatar-image')
    expect(avatarImages).toHaveLength(2) // One in trigger, one in dropdown

    avatarImages.forEach(img => {
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      expect(img).toHaveAttribute('alt', 'John Doe')
    })
  })

  it('should render user initials as fallback when no image', () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          ...mockUser,
          image: null,
        },
      },
      status: 'authenticated',
    } as any)

    render(<NavUser />)

    const avatarFallbacks = screen.getAllByTestId('avatar-fallback')
    expect(avatarFallbacks).toHaveLength(2)

    avatarFallbacks.forEach(fallback => {
      expect(fallback).toHaveTextContent('JD') // John Doe initials
    })
  })

  it('should handle single name for initials', () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          ...mockUser,
          name: 'John',
          image: null,
        },
      },
      status: 'authenticated',
    } as any)

    render(<NavUser />)

    const avatarFallbacks = screen.getAllByTestId('avatar-fallback')
    avatarFallbacks.forEach(fallback => {
      expect(fallback).toHaveTextContent('J')
    })
  })

  it('should render dropdown menu items', () => {
    render(<NavUser />)

    expect(screen.getByText('Comtpe')).toBeInTheDocument()
    expect(screen.getByText('Factures')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Se deconnecter')).toBeInTheDocument()

    expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument()
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
  })

  it('should render dropdown separators', () => {
    render(<NavUser />)

    const separators = screen.getAllByTestId('dropdown-separator')
    expect(separators).toHaveLength(2)
  })

  it('should render dropdown groups', () => {
    render(<NavUser />)

    expect(screen.getByTestId('dropdown-group')).toBeInTheDocument()
  })

  it('should handle sign out click', async () => {
    const user = userEvent.setup()

    render(<NavUser />)

    const signOutItem = screen.getByText('Se deconnecter')
    await user.click(signOutItem)

    expect(mockedSignOut).toHaveBeenCalledWith({
      fetchOptions: {
        onSuccess: expect.any(Function),
      },
    })
  })

  it('should redirect to signin on successful sign out', async () => {
    const user = userEvent.setup()

    // Mock signOut to call onSuccess immediately
    mockedSignOut.mockImplementation(({ fetchOptions }: any) => {
      if (fetchOptions?.onSuccess) {
        fetchOptions.onSuccess()
      }
    })

    render(<NavUser />)

    const signOutItem = screen.getByText('Se deconnecter')
    await user.click(signOutItem)

    const { push } = mockUseRouter()
    expect(push).toHaveBeenCalledWith('/auth/signin')
  })

  it('should render proper sidebar menu button attributes', () => {
    render(<NavUser />)

    const menuButton = screen.getByTestId('sidebar-menu-button')
    expect(menuButton).toHaveAttribute('data-size', 'lg')
    expect(menuButton).toHaveClass(
      'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
    )
  })

  it('should render more vertical icon', () => {
    render(<NavUser />)

    const moreIcon = screen.getByTestId('more-vertical-icon')
    expect(moreIcon).toBeInTheDocument()
    expect(moreIcon).toHaveClass('ml-auto size-4')
  })

  it('should handle mobile sidebar correctly', () => {
    // Mock useSidebar to return mobile state
    jest.doMock('@/components/ui/sidebar', () => ({
      ...jest.requireActual('@/components/ui/sidebar'),
      useSidebar: () => ({ isMobile: true }),
    }))

    render(<NavUser />)

    const dropdownContent = screen.getByTestId('dropdown-content')
    expect(dropdownContent).toHaveAttribute('data-side', 'right')
  })

  it('should handle desktop sidebar correctly', () => {
    render(<NavUser />)

    const dropdownContent = screen.getByTestId('dropdown-content')
    expect(dropdownContent).toHaveAttribute('data-side', 'right')
    expect(dropdownContent).toHaveAttribute('data-align', 'end')
  })

  it('should render user information in dropdown label', () => {
    render(<NavUser />)

    const dropdownLabel = screen.getByTestId('dropdown-label')
    expect(dropdownLabel).toBeInTheDocument()

    // Should contain user info in the label
    expect(dropdownLabel).toContainElement(screen.getAllByText('John Doe')[1]) // Second instance in dropdown
    expect(dropdownLabel).toContainElement(
      screen.getAllByText('john.doe@example.com')[1]
    )
  })

  it('should render FeatureComingSoonDialog', () => {
    render(<NavUser />)

    const dialog = screen.getByTestId('feature-coming-soon-dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('data-open', 'false')
  })

  it('should open dialog when clicking on Compte', async () => {
    const user = userEvent.setup()

    render(<NavUser />)

    const compteItem = screen.getByText('Comtpe')
    await user.click(compteItem)

    const dialog = screen.getByTestId('feature-coming-soon-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
    expect(dialog).toHaveAttribute('data-feature-name', 'Comtpe')
  })

  it('should open dialog when clicking on Factures', async () => {
    const user = userEvent.setup()

    render(<NavUser />)

    const facturesItem = screen.getByText('Factures')
    await user.click(facturesItem)

    const dialog = screen.getByTestId('feature-coming-soon-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
    expect(dialog).toHaveAttribute('data-feature-name', 'Factures')
  })

  it('should open dialog when clicking on Notifications', async () => {
    const user = userEvent.setup()

    render(<NavUser />)

    const notificationsItem = screen.getByText('Notifications')
    await user.click(notificationsItem)

    const dialog = screen.getByTestId('feature-coming-soon-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
    expect(dialog).toHaveAttribute('data-feature-name', 'Notifications')
  })

  it('should close dialog when onOpenChange is called', async () => {
    const user = userEvent.setup()

    render(<NavUser />)

    // Open dialog first
    const compteItem = screen.getByText('Comtpe')
    await user.click(compteItem)

    let dialog = screen.getByTestId('feature-coming-soon-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')

    // Close dialog
    await user.click(dialog)

    dialog = screen.getByTestId('feature-coming-soon-dialog')
    expect(dialog).toHaveAttribute('data-open', 'false')
  })
})
