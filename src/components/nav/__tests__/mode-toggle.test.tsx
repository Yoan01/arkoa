import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { ModeToggle } from '../mode-toggle'

// Mock next-themes
const mockSetTheme = jest.fn()
const mockUseTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Monitor: ({ ...props }) => <div data-testid='monitor-icon' {...props} />,
  Sun: ({ ...props }) => <div data-testid='sun-icon' {...props} />,
  Moon: ({ ...props }) => <div data-testid='moon-icon' {...props} />,
}))

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('ModeToggle', () => {
  const _mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      themes: ['light', 'dark', 'system'],
      forcedTheme: undefined,
      resolvedTheme: 'light',
      systemTheme: 'light',
    })
  })

  it('should render theme toggle buttons', () => {
    render(<ModeToggle />)

    expect(screen.getByTestId('monitor-icon')).toBeInTheDocument()
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<ModeToggle className='custom-class' />)

    const toggleContainer = container.querySelector('.custom-class')
    expect(toggleContainer).toBeInTheDocument()
  })

  it('should call setTheme when theme button is clicked', () => {
    render(<ModeToggle />)

    const systemButton = screen.getByLabelText('System theme')
    const lightButton = screen.getByLabelText('Light theme')
    const darkButton = screen.getByLabelText('Dark theme')

    fireEvent.click(systemButton)
    expect(mockSetTheme).toHaveBeenCalledWith('system')

    fireEvent.click(lightButton)
    expect(mockSetTheme).toHaveBeenCalledWith('light')

    fireEvent.click(darkButton)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should highlight active theme', () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'dark',
      themes: ['light', 'dark', 'system'],
      forcedTheme: undefined,
      resolvedTheme: 'dark',
      systemTheme: 'light',
    })

    render(<ModeToggle />)

    const darkIcon = screen.getByTestId('moon-icon')
    expect(darkIcon).toHaveClass('text-secondary-foreground')
  })

  it('should show inactive theme styling for non-active themes', () => {
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'dark',
      themes: ['light', 'dark', 'system'],
      forcedTheme: undefined,
      resolvedTheme: 'dark',
      systemTheme: 'light',
    })

    render(<ModeToggle />)

    const lightIcon = screen.getByTestId('sun-icon')
    const systemIcon = screen.getByTestId('monitor-icon')

    expect(lightIcon).toHaveClass('text-muted-foreground')
    expect(systemIcon).toHaveClass('text-muted-foreground')
  })

  it('should have proper accessibility attributes', () => {
    render(<ModeToggle />)

    const systemButton = screen.getByLabelText('System theme')
    const lightButton = screen.getByLabelText('Light theme')
    const darkButton = screen.getByLabelText('Dark theme')

    expect(systemButton).toHaveAttribute('type', 'button')
    expect(lightButton).toHaveAttribute('type', 'button')
    expect(darkButton).toHaveAttribute('type', 'button')

    expect(systemButton).toHaveAttribute('aria-label', 'System theme')
    expect(lightButton).toHaveAttribute('aria-label', 'Light theme')
    expect(darkButton).toHaveAttribute('aria-label', 'Dark theme')
  })
})
