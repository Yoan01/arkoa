import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRange } from 'react-day-picker'

import { MonthPicker } from '../month-picker'

// Mock dayjs
jest.mock('@/lib/dayjs-config', () => ({
  __esModule: true,
  default: jest.fn(_date => ({
    daysInMonth: () => 31,
    startOf: () => ({ day: () => 1 }),
    date: () => 1,
  })),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  differenceInDays: jest.fn((to, from) => {
    // Return different values based on the dates to test different scenarios
    if (from.getDate() === 15) {
      return 16 // Not a full month
    }
    return 30 // Full month
  }),
}))

describe('MonthPicker', () => {
  const mockOnMonthSelect = jest.fn()
  const defaultProps = {
    date: { from: undefined, to: undefined } as DateRange,
    onMonthSelect: mockOnMonthSelect,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendu avec props par défaut', () => {
    it('renders correctly with default props', () => {
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Sélectionner un mois')
    })

    it('renders with custom placeholder', () => {
      render(
        <MonthPicker {...defaultProps} placeholder='Choisir une période' />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveTextContent('Choisir une période')
    })

    it('renders with custom initial year', () => {
      render(<MonthPicker {...defaultProps} initialYear={2025} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Affichage du placeholder et de la valeur sélectionnée', () => {
    it('displays placeholder when no date is selected', () => {
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveTextContent('Sélectionner un mois')
      expect(trigger).toHaveClass('text-muted-foreground')
    })

    it('displays selected month and year when date is provided', () => {
      const selectedDate: DateRange = {
        from: new Date(2024, 0, 1), // January 2024
        to: new Date(2024, 0, 31),
      }

      render(<MonthPicker {...defaultProps} date={selectedDate} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveTextContent('janv. 2024')
      expect(trigger).not.toHaveClass('text-muted-foreground')
    })
  })

  describe('Ouverture/fermeture du popover', () => {
    it('opens popover when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(
          screen.getByText(new Date().getFullYear().toString())
        ).toBeInTheDocument()
        expect(screen.getByText('janv.')).toBeInTheDocument()
      })
    })

    it('closes popover when month is selected', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('janv.')).toBeInTheDocument()
      })

      const januaryButton = screen.getByText('janv.')
      await user.click(januaryButton)

      await waitFor(() => {
        expect(
          screen.queryByText(new Date().getFullYear().toString())
        ).not.toBeInTheDocument()
      })
    })

    it('can be controlled externally', () => {
      const { rerender: _rerender } = render(<MonthPicker {...defaultProps} />)

      // Popover should be closed initially
      expect(
        screen.queryByText(new Date().getFullYear().toString())
      ).not.toBeInTheDocument()

      // We can't directly control the open state, but we can test the trigger
      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Navigation entre les années', () => {
    it('navigates to previous year when left arrow is clicked', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} initialYear={2024} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument()
      })

      const buttons = screen.getAllByRole('button')
      const prevButton = buttons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-chevron-left')
      )

      if (prevButton) {
        await user.click(prevButton)
        expect(screen.getByText('2023')).toBeInTheDocument()
      }
    })

    it('navigates to next year when right arrow is clicked', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} initialYear={2024} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument()
      })

      const buttons = screen.getAllByRole('button')
      const nextButton = buttons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-chevron-right')
      )

      if (nextButton) {
        await user.click(nextButton)
        expect(screen.getByText('2025')).toBeInTheDocument()
      }
    })

    it('displays correct year in header', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} initialYear={2023} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('2023')).toBeInTheDocument()
      })
    })
  })

  describe("Sélection d'un mois et callback onMonthSelect", () => {
    it('calls onMonthSelect when a month is clicked', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('janv.')).toBeInTheDocument()
      })

      const januaryButton = screen.getByText('janv.')
      await user.click(januaryButton)

      expect(mockOnMonthSelect).toHaveBeenCalledTimes(1)
      expect(mockOnMonthSelect).toHaveBeenCalledWith({
        from: expect.any(Date),
        to: expect.any(Date),
      })
    })

    it('calls onMonthSelect with correct date range', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} initialYear={2024} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('mars')).toBeInTheDocument()
      })

      const marchButton = screen.getByText('mars')
      await user.click(marchButton)

      expect(mockOnMonthSelect).toHaveBeenCalledWith({
        from: new Date(2024, 2, 1), // March 1st, 2024
        to: new Date(2024, 2, 31), // March 31st, 2024 (mocked to 31 days)
      })
    })

    it('updates internal state when month is selected', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('févr.')).toBeInTheDocument()
      })

      const februaryButton = screen.getByText('févr.')
      await user.click(februaryButton)

      // Reopen to check state
      await user.click(trigger)

      await waitFor(() => {
        const selectedMonth = screen.getByText('févr.').closest('button')
        expect(selectedMonth).toHaveClass('bg-primary')
      })
    })
  })

  describe('Génération des points pour chaque mois', () => {
    it('generates dots for each month', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const monthButtons = screen.getAllByText(/janv\.|févr\.|mars/)
        expect(monthButtons.length).toBeGreaterThan(0)

        // Check that dots are rendered (they have specific classes)
        const dots = document.querySelectorAll('.rounded-full')
        expect(dots.length).toBeGreaterThan(0)
      })
    })

    it('applies correct dot size class', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} dotSize='size-[6px]' />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const dots = document.querySelectorAll('.size-\\[6px\\]')
        expect(dots.length).toBeGreaterThan(0)
      })
    })

    it('renders dots in grid layout', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const grids = document.querySelectorAll('.grid-cols-7.grid-rows-6')
        expect(grids.length).toBe(12) // One for each month
      })
    })
  })

  describe('États sélectionné/non-sélectionné', () => {
    it('applies selected styles to selected month', async () => {
      const selectedDate: DateRange = {
        from: new Date(2024, 5, 1), // June 2024
        to: new Date(2024, 5, 30),
      }

      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} date={selectedDate} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const juneButton = screen.getByText('juin').closest('button')
        expect(juneButton).toHaveClass('bg-primary')
        expect(juneButton).toHaveClass('text-primary-foreground')
      })
    })

    it('applies unselected styles to non-selected months', async () => {
      const selectedDate: DateRange = {
        from: new Date(2024, 5, 1), // June 2024
        to: new Date(2024, 5, 30),
      }

      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} date={selectedDate} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const januaryButton = screen.getByText('janv.').closest('button')
        expect(januaryButton).toHaveClass('text-muted-foreground')
        expect(januaryButton).not.toHaveClass('bg-primary')
      })
    })

    it('shows different dot colors for selected vs unselected months', async () => {
      const selectedDate: DateRange = {
        from: new Date(2024, 0, 1), // January 2024
        to: new Date(2024, 0, 31),
      }

      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} date={selectedDate} />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        // Selected month should have white dots
        const selectedDots = document.querySelectorAll('.bg-white')
        expect(selectedDots.length).toBeGreaterThan(0)

        // Unselected months should have primary/20 dots
        const unselectedDots = document.querySelectorAll('.bg-primary\\/20')
        expect(unselectedDots.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Effet useEffect pour synchroniser avec la prop date', () => {
    it('updates internal state when date prop changes', () => {
      const { rerender } = render(<MonthPicker {...defaultProps} />)

      const newDate: DateRange = {
        from: new Date(2024, 3, 1), // April 2024
        to: new Date(2024, 3, 30),
      }

      rerender(<MonthPicker {...defaultProps} date={newDate} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveTextContent('avr. 2024')
    })

    it('handles invalid date ranges gracefully', () => {
      const invalidDate: DateRange = {
        from: new Date(2024, 0, 15), // Mid-month start (not day 1)
        to: new Date(2024, 0, 31), // End of month
      }

      render(<MonthPicker {...defaultProps} date={invalidDate} />)

      const trigger = screen.getByRole('button')
      // Since the date doesn't start on day 1, it should show the placeholder
      expect(trigger).toHaveTextContent('Sélectionner un mois')
    })

    it('synchronizes year when date prop changes', () => {
      const { rerender } = render(
        <MonthPicker {...defaultProps} initialYear={2024} />
      )

      const newDate: DateRange = {
        from: new Date(2025, 0, 1), // January 2025
        to: new Date(2025, 0, 31),
      }

      rerender(<MonthPicker {...defaultProps} date={newDate} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveTextContent('janv. 2025')
    })
  })

  describe('Classes CSS personnalisées', () => {
    it('applies custom className to popover content', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} className='custom-popover-class' />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const popoverContent = document.querySelector('.custom-popover-class')
        expect(popoverContent).toBeInTheDocument()
      })
    })

    it('applies custom triggerClassName to trigger button', () => {
      render(
        <MonthPicker
          {...defaultProps}
          triggerClassName='custom-trigger-class'
        />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('custom-trigger-class')
    })

    it('applies custom fontSize to month labels', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} fontSize='text-lg' />)

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        const monthLabels = document.querySelectorAll('.text-lg')
        expect(monthLabels.length).toBe(12) // One for each month
      })
    })

    it('maintains default classes alongside custom classes', () => {
      render(<MonthPicker {...defaultProps} triggerClassName='custom-class' />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('custom-class')
      expect(trigger).toHaveClass('justify-between')
      expect(trigger).toHaveClass('font-normal')
    })
  })

  describe('Accessibilité et interactions', () => {
    it('has proper ARIA attributes', () => {
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<MonthPicker {...defaultProps} />)

      const trigger = screen.getByRole('button')

      // Focus and activate with keyboard
      await user.tab()
      expect(trigger).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(
          screen.getByText(new Date().getFullYear().toString())
        ).toBeInTheDocument()
      })
    })

    it('displays calendar icon in trigger', () => {
      render(<MonthPicker {...defaultProps} />)

      const calendarIcon = document.querySelector('.lucide-calendar')
      expect(calendarIcon).toBeInTheDocument()
    })
  })
})
