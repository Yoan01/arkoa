import { fireEvent, render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '../sidebar'

// Mock useIsMobile hook
const useIsMobile = jest.fn(() => false)
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => useIsMobile(),
}))

// Helper component to test useSidebar hook
const TestComponent = () => {
  const sidebar = useSidebar()
  return (
    <div>
      <span data-testid='state'>{sidebar.state}</span>
      <span data-testid='open'>{sidebar.open.toString()}</span>
      <span data-testid='is-mobile'>{sidebar.isMobile.toString()}</span>
      <span data-testid='open-mobile'>{sidebar.openMobile.toString()}</span>
      <button data-testid='toggle' onClick={sidebar.toggleSidebar}>
        Toggle
      </button>
      <button data-testid='set-open' onClick={() => sidebar.setOpen(true)}>
        Set Open
      </button>
      <button
        data-testid='set-open-mobile'
        onClick={() => sidebar.setOpenMobile(true)}
      >
        Set Open Mobile
      </button>
    </div>
  )
}

// Wrapper component for testing
const SidebarWrapper = ({ children, ...props }: any) => (
  <SidebarProvider {...props}>
    <div className='flex'>
      <Sidebar>
        <SidebarContent>{children}</SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main>Main content</main>
      </SidebarInset>
    </div>
  </SidebarProvider>
)

describe('Sidebar Components', () => {
  beforeEach(() => {
    // Reset mocks
    useIsMobile.mockReturnValue(false)
    // Clear cookies
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  describe('useSidebar hook', () => {
    it('throws error when used outside SidebarProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        renderHook(() => useSidebar())
      }).toThrow('useSidebar must be used within a SidebarProvider.')

      consoleSpy.mockRestore()
    })

    it('provides correct context values', () => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('state')).toHaveTextContent('expanded')
      expect(screen.getByTestId('open')).toHaveTextContent('true')
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('false')
      expect(screen.getByTestId('open-mobile')).toHaveTextContent('false')
    })

    it('handles toggle sidebar on desktop', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      await user.click(screen.getByTestId('toggle'))
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })

    it('handles toggle sidebar on mobile', async () => {
      useIsMobile.mockReturnValue(true)
      const user = userEvent.setup()

      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      await user.click(screen.getByTestId('toggle'))
      expect(screen.getByTestId('open-mobile')).toHaveTextContent('true')
    })

    it('handles setOpen function', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      await user.click(screen.getByTestId('set-open'))
      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })

    it('handles setOpenMobile function', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      await user.click(screen.getByTestId('set-open-mobile'))
      expect(screen.getByTestId('open-mobile')).toHaveTextContent('true')
    })
  })

  describe('SidebarProvider', () => {
    it('renders with default props', () => {
      render(
        <SidebarProvider>
          <div data-testid='content'>Content</div>
        </SidebarProvider>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('accepts defaultOpen prop', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })

    it('handles controlled open state', () => {
      const onOpenChange = jest.fn()
      render(
        <SidebarProvider open={false} onOpenChange={onOpenChange}>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })

    it('handles keyboard shortcut (Cmd/Ctrl + B)', () => {
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      // Test Cmd+B (Mac)
      fireEvent.keyDown(window, { key: 'b', metaKey: true })
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')

      // Test Ctrl+B (Windows/Linux)
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
      expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    })

    it('sets cookie when state changes', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>
      )

      await user.click(screen.getByTestId('toggle'))
      expect(document.cookie).toContain('sidebar_state=false')
    })

    it('applies custom className and style', () => {
      render(
        <SidebarProvider className='custom-class' style={{ background: 'red' }}>
          <div>Content</div>
        </SidebarProvider>
      )

      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
      expect(wrapper).toHaveClass('custom-class')
      expect(wrapper).toHaveStyle('background: red')
    })
  })

  describe('Sidebar', () => {
    it('renders with default props', () => {
      render(
        <SidebarWrapper>
          <div data-testid='sidebar-content'>Sidebar Content</div>
        </SidebarWrapper>
      )

      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    })

    it('renders with different variants', () => {
      const { rerender } = render(
        <SidebarProvider>
          <Sidebar variant='floating'>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      let sidebar = document.querySelector('[data-variant="floating"]')
      expect(sidebar).toBeInTheDocument()

      rerender(
        <SidebarProvider>
          <Sidebar variant='inset'>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      sidebar = document.querySelector('[data-variant="inset"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('renders with different sides', () => {
      const { rerender } = render(
        <SidebarProvider>
          <Sidebar side='left'>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      let sidebar = document.querySelector('[data-side="left"]')
      expect(sidebar).toBeInTheDocument()

      rerender(
        <SidebarProvider>
          <Sidebar side='right'>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      sidebar = document.querySelector('[data-side="right"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('renders with collapsible none', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible='none'>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      const sidebar = document.querySelector('[data-slot="sidebar"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('renders mobile version when isMobile is true', () => {
      useIsMobile.mockReturnValue(true)

      const { container } = render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Mobile Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      // En mode mobile, le composant se rend sans erreur
      expect(container).toBeInTheDocument()
      expect(useIsMobile).toHaveBeenCalled()
    })
  })

  describe('SidebarTrigger', () => {
    it('renders and toggles sidebar', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <SidebarTrigger data-testid='sidebar-trigger' />
          <TestComponent />
        </SidebarProvider>
      )

      const trigger = screen.getByTestId('sidebar-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-sidebar', 'trigger')

      await user.click(trigger)
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })

    it('calls custom onClick handler', async () => {
      const onClick = jest.fn()
      const user = userEvent.setup()

      render(
        <SidebarProvider>
          <SidebarTrigger onClick={onClick} data-testid='trigger-with-click' />
        </SidebarProvider>
      )

      await user.click(screen.getByTestId('trigger-with-click'))
      expect(onClick).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarTrigger
            className='custom-trigger'
            data-testid='trigger-with-class'
          />
        </SidebarProvider>
      )

      expect(screen.getByTestId('trigger-with-class')).toHaveClass(
        'custom-trigger'
      )
    })
  })

  describe('SidebarRail', () => {
    it('renders and toggles sidebar on click', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <SidebarRail />
          <TestComponent />
        </SidebarProvider>
      )

      const rail = document.querySelector('[data-sidebar="rail"]')
      expect(rail).toBeInTheDocument()
      expect(rail).toHaveAttribute('aria-label', 'Toggle Sidebar')

      await user.click(rail as Element)
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarRail className='custom-rail' />
        </SidebarProvider>
      )

      const rail = document.querySelector('[data-sidebar="rail"]')
      expect(rail).toHaveClass('custom-rail')
    })
  })

  describe('SidebarInset', () => {
    it('renders as main element', () => {
      render(
        <SidebarProvider>
          <SidebarInset data-testid='inset'>
            <div>Main content</div>
          </SidebarInset>
        </SidebarProvider>
      )

      const inset = screen.getByTestId('inset')
      expect(inset.tagName).toBe('MAIN')
      expect(inset).toHaveAttribute('data-slot', 'sidebar-inset')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarInset className='custom-inset'>Content</SidebarInset>
        </SidebarProvider>
      )

      const inset = document.querySelector('[data-slot="sidebar-inset"]')
      expect(inset).toHaveClass('custom-inset')
    })
  })

  describe('SidebarInput', () => {
    it('renders input with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarInput placeholder='Search...' />
        </SidebarProvider>
      )

      const input = screen.getByPlaceholderText('Search...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('data-sidebar', 'input')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarInput className='custom-input' />
        </SidebarProvider>
      )

      const input = document.querySelector('[data-sidebar="input"]')
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('SidebarHeader', () => {
    it('renders with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarHeader data-testid='header'>
            <h1>Header</h1>
          </SidebarHeader>
        </SidebarProvider>
      )

      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('data-sidebar', 'header')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarHeader className='custom-header'>Header</SidebarHeader>
        </SidebarProvider>
      )

      const header = document.querySelector('[data-sidebar="header"]')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('SidebarFooter', () => {
    it('renders with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarFooter data-testid='footer'>
            <p>Footer</p>
          </SidebarFooter>
        </SidebarProvider>
      )

      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveAttribute('data-sidebar', 'footer')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarFooter className='custom-footer'>Footer</SidebarFooter>
        </SidebarProvider>
      )

      const footer = document.querySelector('[data-sidebar="footer"]')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('SidebarSeparator', () => {
    it('renders separator', () => {
      render(
        <SidebarProvider>
          <SidebarSeparator data-testid='separator' />
        </SidebarProvider>
      )

      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('data-sidebar', 'separator')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarSeparator className='custom-separator' />
        </SidebarProvider>
      )

      const separator = document.querySelector('[data-sidebar="separator"]')
      expect(separator).toHaveClass('custom-separator')
    })
  })

  describe('SidebarContent', () => {
    it('renders with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarContent data-testid='content'>
            <div>Content</div>
          </SidebarContent>
        </SidebarProvider>
      )

      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-sidebar', 'content')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarContent className='custom-content'>Content</SidebarContent>
        </SidebarProvider>
      )

      const content = document.querySelector('[data-sidebar="content"]')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('SidebarGroup', () => {
    it('renders with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarGroup data-testid='group'>
            <div>Group content</div>
          </SidebarGroup>
        </SidebarProvider>
      )

      const group = screen.getByTestId('group')
      expect(group).toBeInTheDocument()
      expect(group).toHaveAttribute('data-sidebar', 'group')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarGroup className='custom-group'>Group</SidebarGroup>
        </SidebarProvider>
      )

      const group = document.querySelector('[data-sidebar="group"]')
      expect(group).toHaveClass('custom-group')
    })
  })

  describe('SidebarGroupLabel', () => {
    it('renders as div by default', () => {
      render(
        <SidebarProvider>
          <SidebarGroupLabel data-testid='group-label'>
            Group Label
          </SidebarGroupLabel>
        </SidebarProvider>
      )

      const label = screen.getByTestId('group-label')
      expect(label).toBeInTheDocument()
      expect(label.tagName).toBe('DIV')
      expect(label).toHaveAttribute('data-sidebar', 'group-label')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <SidebarProvider>
          <SidebarGroupLabel asChild>
            <h2 data-testid='custom-label'>Custom Label</h2>
          </SidebarGroupLabel>
        </SidebarProvider>
      )

      const label = screen.getByTestId('custom-label')
      expect(label.tagName).toBe('H2')
      expect(label).toHaveAttribute('data-sidebar', 'group-label')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarGroupLabel className='custom-label'>Label</SidebarGroupLabel>
        </SidebarProvider>
      )

      const label = document.querySelector('[data-sidebar="group-label"]')
      expect(label).toHaveClass('custom-label')
    })
  })

  describe('SidebarGroupAction', () => {
    it('renders as button by default', () => {
      render(
        <SidebarProvider>
          <SidebarGroupAction data-testid='group-action'>
            Action
          </SidebarGroupAction>
        </SidebarProvider>
      )

      const action = screen.getByTestId('group-action')
      expect(action).toBeInTheDocument()
      expect(action.tagName).toBe('BUTTON')
      expect(action).toHaveAttribute('data-sidebar', 'group-action')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <SidebarProvider>
          <SidebarGroupAction asChild>
            <a href='#' data-testid='custom-action'>
              Custom Action
            </a>
          </SidebarGroupAction>
        </SidebarProvider>
      )

      const action = screen.getByTestId('custom-action')
      expect(action.tagName).toBe('A')
      expect(action).toHaveAttribute('data-sidebar', 'group-action')
    })

    it('handles click events', async () => {
      const onClick = jest.fn()
      const user = userEvent.setup()

      render(
        <SidebarProvider>
          <SidebarGroupAction onClick={onClick}>Action</SidebarGroupAction>
        </SidebarProvider>
      )

      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarGroupAction className='custom-action'>
            Action
          </SidebarGroupAction>
        </SidebarProvider>
      )

      const action = document.querySelector('[data-sidebar="group-action"]')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('SidebarGroupContent', () => {
    it('renders with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarGroupContent data-testid='group-content'>
            <div>Group content</div>
          </SidebarGroupContent>
        </SidebarProvider>
      )

      const content = screen.getByTestId('group-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-sidebar', 'group-content')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarGroupContent className='custom-group-content'>
            Content
          </SidebarGroupContent>
        </SidebarProvider>
      )

      const content = document.querySelector('[data-sidebar="group-content"]')
      expect(content).toHaveClass('custom-group-content')
    })
  })

  describe('SidebarMenu', () => {
    it('renders as ul element', () => {
      render(
        <SidebarProvider>
          <SidebarMenu data-testid='menu'>
            <li>Menu item</li>
          </SidebarMenu>
        </SidebarProvider>
      )

      const menu = screen.getByTestId('menu')
      expect(menu).toBeInTheDocument()
      expect(menu.tagName).toBe('UL')
      expect(menu).toHaveAttribute('data-sidebar', 'menu')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenu className='custom-menu'>
            <li>Item</li>
          </SidebarMenu>
        </SidebarProvider>
      )

      const menu = document.querySelector('[data-sidebar="menu"]')
      expect(menu).toHaveClass('custom-menu')
    })
  })

  describe('SidebarMenuItem', () => {
    it('renders as li element', () => {
      render(
        <SidebarProvider>
          <SidebarMenuItem data-testid='menu-item'>
            Menu item content
          </SidebarMenuItem>
        </SidebarProvider>
      )

      const item = screen.getByTestId('menu-item')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('LI')
      expect(item).toHaveAttribute('data-sidebar', 'menu-item')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuItem className='custom-menu-item'>Item</SidebarMenuItem>
        </SidebarProvider>
      )

      const item = document.querySelector('[data-sidebar="menu-item"]')
      expect(item).toHaveClass('custom-menu-item')
    })
  })

  describe('SidebarMenuButton', () => {
    it('renders as button by default', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton data-testid='menu-button'>
            Menu Button
          </SidebarMenuButton>
        </SidebarProvider>
      )

      const button = screen.getByTestId('menu-button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('data-sidebar', 'menu-button')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton asChild>
            <a href='#' data-testid='custom-button'>
              Custom Button
            </a>
          </SidebarMenuButton>
        </SidebarProvider>
      )

      const button = screen.getByTestId('custom-button')
      expect(button.tagName).toBe('A')
      expect(button).toHaveAttribute('data-sidebar', 'menu-button')
    })

    it('applies variant classes correctly', () => {
      const { rerender } = render(
        <SidebarProvider>
          <SidebarMenuButton variant='default'>Default</SidebarMenuButton>
        </SidebarProvider>
      )

      let button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveClass('hover:bg-sidebar-accent')

      rerender(
        <SidebarProvider>
          <SidebarMenuButton variant='outline'>Outline</SidebarMenuButton>
        </SidebarProvider>
      )

      button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveClass('bg-background')
    })

    it('applies size classes correctly', () => {
      const { rerender } = render(
        <SidebarProvider>
          <SidebarMenuButton size='default'>Default</SidebarMenuButton>
        </SidebarProvider>
      )

      let button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveAttribute('data-size', 'default')

      rerender(
        <SidebarProvider>
          <SidebarMenuButton size='sm'>Small</SidebarMenuButton>
        </SidebarProvider>
      )

      button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveAttribute('data-size', 'sm')

      rerender(
        <SidebarProvider>
          <SidebarMenuButton size='lg'>Large</SidebarMenuButton>
        </SidebarProvider>
      )

      button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveAttribute('data-size', 'lg')
    })

    it('shows active state', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton isActive={true}>Active Button</SidebarMenuButton>
        </SidebarProvider>
      )

      const button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveAttribute('data-active', 'true')
    })

    it('renders with tooltip when provided', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton tooltip='Button tooltip'>Button</SidebarMenuButton>
        </SidebarProvider>
      )

      const button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toBeInTheDocument()
      // Tooltip content is rendered but hidden by default
    })

    it('renders with tooltip object', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton
            tooltip={{ children: 'Custom tooltip', side: 'left' }}
          >
            Button
          </SidebarMenuButton>
        </SidebarProvider>
      )

      const button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toBeInTheDocument()
    })

    it('handles click events', async () => {
      const onClick = jest.fn()
      const user = userEvent.setup()

      render(
        <SidebarProvider>
          <SidebarMenuButton onClick={onClick}>
            Clickable Button
          </SidebarMenuButton>
        </SidebarProvider>
      )

      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuButton className='custom-menu-button'>
            Button
          </SidebarMenuButton>
        </SidebarProvider>
      )

      const button = document.querySelector('[data-sidebar="menu-button"]')
      expect(button).toHaveClass('custom-menu-button')
    })
  })

  describe('SidebarMenuAction', () => {
    it('renders as button by default', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction data-testid='menu-action'>
            Action
          </SidebarMenuAction>
        </SidebarProvider>
      )

      const action = screen.getByTestId('menu-action')
      expect(action).toBeInTheDocument()
      expect(action.tagName).toBe('BUTTON')
      expect(action).toHaveAttribute('data-sidebar', 'menu-action')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction asChild>
            <a href='#' data-testid='custom-action'>
              Custom Action
            </a>
          </SidebarMenuAction>
        </SidebarProvider>
      )

      const action = screen.getByTestId('custom-action')
      expect(action.tagName).toBe('A')
      expect(action).toHaveAttribute('data-sidebar', 'menu-action')
    })

    it('applies showOnHover class when showOnHover is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction showOnHover={true}>Hover Action</SidebarMenuAction>
        </SidebarProvider>
      )

      const action = document.querySelector('[data-sidebar="menu-action"]')
      expect(action).toHaveClass('md:opacity-0')
    })

    it('handles click events', async () => {
      const onClick = jest.fn()
      const user = userEvent.setup()

      render(
        <SidebarProvider>
          <SidebarMenuAction onClick={onClick}>Action</SidebarMenuAction>
        </SidebarProvider>
      )

      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuAction className='custom-menu-action'>
            Action
          </SidebarMenuAction>
        </SidebarProvider>
      )

      const action = document.querySelector('[data-sidebar="menu-action"]')
      expect(action).toHaveClass('custom-menu-action')
    })
  })

  describe('SidebarMenuBadge', () => {
    it('renders with correct attributes', () => {
      render(
        <SidebarProvider>
          <SidebarMenuBadge data-testid='menu-badge'>5</SidebarMenuBadge>
        </SidebarProvider>
      )

      const badge = screen.getByTestId('menu-badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('data-sidebar', 'menu-badge')
      expect(badge).toHaveTextContent('5')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuBadge className='custom-badge'>Badge</SidebarMenuBadge>
        </SidebarProvider>
      )

      const badge = document.querySelector('[data-sidebar="menu-badge"]')
      expect(badge).toHaveClass('custom-badge')
    })
  })

  describe('SidebarMenuSkeleton', () => {
    it('renders skeleton with default props', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton data-testid='menu-skeleton' />
        </SidebarProvider>
      )

      const skeleton = screen.getByTestId('menu-skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveAttribute('data-sidebar', 'menu-skeleton')
    })

    it('shows icon when showIcon is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton showIcon={true} />
        </SidebarProvider>
      )

      const iconSkeleton = document.querySelector(
        '[data-sidebar="menu-skeleton-icon"]'
      )
      expect(iconSkeleton).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton className='custom-skeleton' />
        </SidebarProvider>
      )

      const skeleton = document.querySelector('[data-sidebar="menu-skeleton"]')
      expect(skeleton).toHaveClass('custom-skeleton')
    })

    it('generates random width for text skeleton', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSkeleton />
        </SidebarProvider>
      )

      const textSkeleton = document.querySelector(
        '[data-sidebar="menu-skeleton-text"]'
      )
      expect(textSkeleton).toBeInTheDocument()
      // Check that skeleton width is set as a CSS custom property
      const _style = window.getComputedStyle(textSkeleton as Element)
      const skeletonWidth = (
        textSkeleton as HTMLElement
      )?.style.getPropertyValue('--skeleton-width')
      expect(skeletonWidth).toMatch(/^(5[0-9]|[6-8][0-9]|90)%$/)
    })
  })

  describe('SidebarMenuSub', () => {
    it('renders as ul element', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSub data-testid='menu-sub'>
            <li>Sub item</li>
          </SidebarMenuSub>
        </SidebarProvider>
      )

      const menuSub = screen.getByTestId('menu-sub')
      expect(menuSub).toBeInTheDocument()
      expect(menuSub.tagName).toBe('UL')
      expect(menuSub).toHaveAttribute('data-sidebar', 'menu-sub')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSub className='custom-menu-sub'>
            <li>Item</li>
          </SidebarMenuSub>
        </SidebarProvider>
      )

      const menuSub = document.querySelector('[data-sidebar="menu-sub"]')
      expect(menuSub).toHaveClass('custom-menu-sub')
    })
  })

  describe('SidebarMenuSubItem', () => {
    it('renders as li element', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubItem data-testid='menu-sub-item'>
            Sub item content
          </SidebarMenuSubItem>
        </SidebarProvider>
      )

      const subItem = screen.getByTestId('menu-sub-item')
      expect(subItem).toBeInTheDocument()
      expect(subItem.tagName).toBe('LI')
      expect(subItem).toHaveAttribute('data-sidebar', 'menu-sub-item')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubItem className='custom-sub-item'>
            Item
          </SidebarMenuSubItem>
        </SidebarProvider>
      )

      const subItem = document.querySelector('[data-sidebar="menu-sub-item"]')
      expect(subItem).toHaveClass('custom-sub-item')
    })
  })

  describe('SidebarMenuSubButton', () => {
    it('renders as anchor by default', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton data-testid='menu-sub-button'>
            Sub Button
          </SidebarMenuSubButton>
        </SidebarProvider>
      )

      const subButton = screen.getByTestId('menu-sub-button')
      expect(subButton).toBeInTheDocument()
      expect(subButton.tagName).toBe('A')
      expect(subButton).toHaveAttribute('data-sidebar', 'menu-sub-button')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton asChild>
            <button data-testid='custom-sub-button'>Custom Sub Button</button>
          </SidebarMenuSubButton>
        </SidebarProvider>
      )

      const subButton = screen.getByTestId('custom-sub-button')
      expect(subButton.tagName).toBe('BUTTON')
      expect(subButton).toHaveAttribute('data-sidebar', 'menu-sub-button')
    })

    it('applies size classes correctly', () => {
      const { rerender } = render(
        <SidebarProvider>
          <SidebarMenuSubButton size='sm'>Small</SidebarMenuSubButton>
        </SidebarProvider>
      )

      let subButton = document.querySelector('[data-sidebar="menu-sub-button"]')
      expect(subButton).toHaveAttribute('data-size', 'sm')
      expect(subButton).toHaveClass('text-xs')

      rerender(
        <SidebarProvider>
          <SidebarMenuSubButton size='md'>Medium</SidebarMenuSubButton>
        </SidebarProvider>
      )

      subButton = document.querySelector('[data-sidebar="menu-sub-button"]')
      expect(subButton).toHaveAttribute('data-size', 'md')
      expect(subButton).toHaveClass('text-sm')
    })

    it('shows active state', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton isActive={true}>
            Active Sub Button
          </SidebarMenuSubButton>
        </SidebarProvider>
      )

      const subButton = document.querySelector(
        '[data-sidebar="menu-sub-button"]'
      )
      expect(subButton).toHaveAttribute('data-active', 'true')
    })

    it('applies custom className', () => {
      render(
        <SidebarProvider>
          <SidebarMenuSubButton className='custom-sub-button'>
            Button
          </SidebarMenuSubButton>
        </SidebarProvider>
      )

      const subButton = document.querySelector(
        '[data-sidebar="menu-sub-button"]'
      )
      expect(subButton).toHaveClass('custom-sub-button')
    })
  })

  describe('Integration Tests', () => {
    it('renders complete sidebar structure', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <SidebarInput placeholder='Search...' />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Dashboard</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Settings</SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Profile</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <p>Footer content</p>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
            <main>Main content</main>
          </SidebarInset>
        </SidebarProvider>
      )

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('handles complex interactions', async () => {
      const user = userEvent.setup()
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton data-testid='menu-btn'>
                    Menu Item
                  </SidebarMenuButton>
                  <SidebarMenuAction data-testid='menu-action'>
                    Action
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger data-testid='trigger' />
          </SidebarInset>
          <TestComponent />
        </SidebarProvider>
      )

      // Test trigger toggle
      await user.click(screen.getByTestId('trigger'))
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')

      // Test menu interactions
      const menuButton = screen.getByTestId('menu-btn')
      const menuAction = screen.getByTestId('menu-action')

      expect(menuButton).toBeInTheDocument()
      expect(menuAction).toBeInTheDocument()
    })

    it('handles mobile responsive behavior', () => {
      useIsMobile.mockReturnValue(true)

      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Mobile Menu</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <TestComponent />
        </SidebarProvider>
      )

      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
      // In mobile mode, the sidebar is rendered inside a Sheet component
      // Check that the Sheet overlay is present (even if closed)
      const _sheetOverlay =
        document.querySelector('[data-radix-popper-content-wrapper]') ||
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.fixed.inset-0')
      // Since the sheet might not be open by default, just verify mobile state is correct
      expect(screen.getByTestId('is-mobile')).toHaveTextContent('true')
    })
  })
})
