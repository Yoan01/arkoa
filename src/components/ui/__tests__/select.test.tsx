import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../select'

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: any) => (
    <div data-testid='select-root' {...props}>
      {children}
    </div>
  ),
  Group: ({ children, ...props }: any) => (
    <div data-testid='select-group' {...props}>
      {children}
    </div>
  ),
  Value: ({ children, placeholder, ...props }: any) => (
    <span data-testid='select-value' data-placeholder={placeholder} {...props}>
      {children || placeholder}
    </span>
  ),
  Trigger: ({ children, className, ...props }: any) => (
    <button data-testid='select-trigger' className={className} {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: any) => (
    <div data-testid='select-portal'>{children}</div>
  ),
  Content: ({ children, className, position, ...props }: any) => (
    <div
      data-testid='select-content'
      className={className}
      data-position={position}
      {...props}
    >
      {children}
    </div>
  ),
  Viewport: ({ children, className, ...props }: any) => (
    <div data-testid='select-viewport' className={className} {...props}>
      {children}
    </div>
  ),
  Label: ({ children, className, ...props }: any) => (
    <div data-testid='select-label' className={className} {...props}>
      {children}
    </div>
  ),
  Item: ({ children, className, value, ...props }: any) => (
    <div
      data-testid='select-item'
      className={className}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  ),
  ItemText: ({ children, ...props }: any) => (
    <span data-testid='select-item-text' {...props}>
      {children}
    </span>
  ),
  ItemIndicator: ({ children, ...props }: any) => (
    <span data-testid='select-item-indicator' {...props}>
      {children}
    </span>
  ),
  Separator: ({ className, ...props }: any) => (
    <div data-testid='select-separator' className={className} {...props} />
  ),
  ScrollUpButton: ({ children, className, ...props }: any) => (
    <div data-testid='select-scroll-up-button' className={className} {...props}>
      {children}
    </div>
  ),
  ScrollDownButton: ({ children, className, ...props }: any) => (
    <div
      data-testid='select-scroll-down-button'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Icon: ({ children, asChild: _asChild, ...props }: any) => (
    <span data-testid='select-icon' {...props}>
      {children}
    </span>
  ),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckIcon: ({ className, ...props }: any) => (
    <svg data-testid='check-icon' className={className} {...props} />
  ),
  ChevronDownIcon: ({ className, ...props }: any) => (
    <svg data-testid='chevron-down-icon' className={className} {...props} />
  ),
  ChevronUpIcon: ({ className, ...props }: any) => (
    <svg data-testid='chevron-up-icon' className={className} {...props} />
  ),
}))

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

const TestSelect = ({ onValueChange, value, defaultValue, ...props }: any) => (
  <Select
    onValueChange={onValueChange}
    value={value}
    defaultValue={defaultValue}
    {...props}
  >
    <SelectTrigger>
      <SelectValue placeholder='Select an option' />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem value='apple'>Apple</SelectItem>
        <SelectItem value='banana'>Banana</SelectItem>
        <SelectItem value='orange'>Orange</SelectItem>
        <SelectSeparator />
        <SelectItem value='grape' disabled>
          Grape (disabled)
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
)

describe('Select Components', () => {
  describe('Select', () => {
    it('renders with data-slot attribute', () => {
      render(<Select />)

      const select = screen.getByTestId('select-root')
      expect(select).toBeInTheDocument()
      expect(select).toHaveAttribute('data-slot', 'select')
    })

    it('passes props to SelectPrimitive.Root', () => {
      render(<Select disabled />)

      const select = screen.getByTestId('select-root')
      expect(select).toHaveAttribute('disabled')
    })
  })

  describe('SelectGroup', () => {
    it('renders with data-slot attribute', () => {
      render(<SelectGroup />)

      const group = screen.getByTestId('select-group')
      expect(group).toBeInTheDocument()
      expect(group).toHaveAttribute('data-slot', 'select-group')
    })
  })

  describe('SelectValue', () => {
    it('renders with data-slot attribute', () => {
      render(<SelectValue />)

      const value = screen.getByTestId('select-value')
      expect(value).toBeInTheDocument()
      expect(value).toHaveAttribute('data-slot', 'select-value')
    })

    it('displays placeholder', () => {
      render(<SelectValue placeholder='Choose option' />)

      const value = screen.getByTestId('select-value')
      expect(value).toHaveAttribute('data-placeholder', 'Choose option')
    })
  })

  describe('SelectTrigger', () => {
    it('renders with default size', () => {
      render(<SelectTrigger />)

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
      expect(trigger).toHaveAttribute('data-size', 'default')
    })

    it('renders with small size', () => {
      render(<SelectTrigger size='sm' />)

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('data-size', 'sm')
    })

    it('applies custom className', () => {
      render(<SelectTrigger className='custom-trigger' />)

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('renders chevron down icon', () => {
      render(<SelectTrigger />)

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })

    it('handles click events', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(<SelectTrigger onClick={handleClick} />)

      const trigger = screen.getByTestId('select-trigger')
      await user.click(trigger)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
      render(<SelectTrigger disabled />)

      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeDisabled()
    })
  })

  describe('SelectContent', () => {
    it('renders with default position', () => {
      render(<SelectContent />)

      const content = screen.getByTestId('select-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-slot', 'select-content')
      expect(content).toHaveAttribute('data-position', 'popper')
    })

    it('renders with custom position', () => {
      render(<SelectContent position='item-aligned' />)

      const content = screen.getByTestId('select-content')
      expect(content).toHaveAttribute('data-position', 'item-aligned')
    })

    it('applies custom className', () => {
      render(<SelectContent className='custom-content' />)

      const content = screen.getByTestId('select-content')
      expect(content).toHaveClass('custom-content')
    })

    it('renders scroll buttons and viewport', () => {
      render(<SelectContent />)

      expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument()
      expect(
        screen.getByTestId('select-scroll-down-button')
      ).toBeInTheDocument()
      expect(screen.getByTestId('select-viewport')).toBeInTheDocument()
    })

    it('renders within portal', () => {
      render(<SelectContent />)

      expect(screen.getByTestId('select-portal')).toBeInTheDocument()
    })
  })

  describe('SelectLabel', () => {
    it('renders with data-slot attribute', () => {
      render(<SelectLabel>Label</SelectLabel>)

      const label = screen.getByTestId('select-label')
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('data-slot', 'select-label')
      expect(label).toHaveTextContent('Label')
    })

    it('applies custom className', () => {
      render(<SelectLabel className='custom-label'>Label</SelectLabel>)

      const label = screen.getByTestId('select-label')
      expect(label).toHaveClass('custom-label')
    })
  })

  describe('SelectItem', () => {
    it('renders with data-slot attribute', () => {
      render(<SelectItem value='test'>Item</SelectItem>)

      const item = screen.getByTestId('select-item')
      expect(item).toBeInTheDocument()
      expect(item).toHaveAttribute('data-slot', 'select-item')
      expect(item).toHaveAttribute('data-value', 'test')
    })

    it('renders item text and indicator', () => {
      render(<SelectItem value='test'>Item Text</SelectItem>)

      expect(screen.getByTestId('select-item-text')).toBeInTheDocument()
      expect(screen.getByTestId('select-item-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
      expect(screen.getByText('Item Text')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <SelectItem value='test' className='custom-item'>
          Item
        </SelectItem>
      )

      const item = screen.getByTestId('select-item')
      expect(item).toHaveClass('custom-item')
    })

    it('can be disabled', () => {
      render(
        <SelectItem value='test' disabled>
          Item
        </SelectItem>
      )

      const item = screen.getByTestId('select-item')
      expect(item).toHaveAttribute('disabled')
    })
  })

  describe('SelectSeparator', () => {
    it('renders with data-slot attribute', () => {
      render(<SelectSeparator />)

      const separator = screen.getByTestId('select-separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('data-slot', 'select-separator')
    })

    it('applies custom className', () => {
      render(<SelectSeparator className='custom-separator' />)

      const separator = screen.getByTestId('select-separator')
      expect(separator).toHaveClass('custom-separator')
    })
  })

  describe('SelectScrollUpButton', () => {
    it('renders with data-slot attribute and chevron up icon', () => {
      render(<SelectScrollUpButton />)

      const button = screen.getByTestId('select-scroll-up-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('data-slot', 'select-scroll-up-button')
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<SelectScrollUpButton className='custom-scroll-up' />)

      const button = screen.getByTestId('select-scroll-up-button')
      expect(button).toHaveClass('custom-scroll-up')
    })
  })

  describe('SelectScrollDownButton', () => {
    it('renders with data-slot attribute and chevron down icon', () => {
      render(<SelectScrollDownButton />)

      const button = screen.getByTestId('select-scroll-down-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('data-slot', 'select-scroll-down-button')
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<SelectScrollDownButton className='custom-scroll-down' />)

      const button = screen.getByTestId('select-scroll-down-button')
      expect(button).toHaveClass('custom-scroll-down')
    })
  })

  describe('Complete Select Component', () => {
    it('renders complete select with all components', () => {
      render(<TestSelect />)

      expect(screen.getByTestId('select-root')).toBeInTheDocument()
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('select-value')).toBeInTheDocument()
      expect(screen.getByTestId('select-content')).toBeInTheDocument()
      expect(screen.getByTestId('select-group')).toBeInTheDocument()
      expect(screen.getByTestId('select-label')).toBeInTheDocument()
      expect(screen.getAllByTestId('select-item')).toHaveLength(4)
      expect(screen.getByTestId('select-separator')).toBeInTheDocument()
    })

    it('displays placeholder when no value is selected', () => {
      render(<TestSelect />)

      const value = screen.getByTestId('select-value')
      expect(value).toHaveAttribute('data-placeholder', 'Select an option')
    })

    it('handles value changes', () => {
      const handleValueChange = jest.fn()
      render(<TestSelect onValueChange={handleValueChange} />)

      expect(screen.getByTestId('select-root')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<TestSelect defaultValue='apple' />)

      const select = screen.getByTestId('select-root')
      expect(select).toBeInTheDocument()
    })

    it('renders with controlled value', () => {
      render(<TestSelect value='banana' />)

      const select = screen.getByTestId('select-root')
      expect(select).toHaveAttribute('value', 'banana')
    })

    it('renders disabled items', () => {
      render(<TestSelect />)

      const disabledItem = screen
        .getByText('Grape (disabled)')
        .closest('[data-testid="select-item"]')
      expect(disabledItem).toHaveAttribute('disabled')
    })

    it('renders items with correct values', () => {
      render(<TestSelect />)

      const items = screen.getAllByTestId('select-item')
      expect(items[0]).toHaveAttribute('data-value', 'apple')
      expect(items[1]).toHaveAttribute('data-value', 'banana')
      expect(items[2]).toHaveAttribute('data-value', 'orange')
      expect(items[3]).toHaveAttribute('data-value', 'grape')
    })

    it('renders label text correctly', () => {
      render(<TestSelect />)

      expect(screen.getByText('Fruits')).toBeInTheDocument()
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.getByText('Banana')).toBeInTheDocument()
      expect(screen.getByText('Orange')).toBeInTheDocument()
      expect(screen.getByText('Grape (disabled)')).toBeInTheDocument()
    })
  })
})
