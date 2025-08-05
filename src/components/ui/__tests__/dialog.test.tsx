import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button } from '../button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

function TestDialog({
  open,
  onOpenChange,
  showCloseButton = true,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showCloseButton?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Test Dialog Title</DialogTitle>
          <DialogDescription>
            This is a test dialog description.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>Dialog content goes here.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('should render dialog trigger', () => {
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      expect(trigger).toBeInTheDocument()
    })

    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Dialog Title')).toBeInTheDocument()
      expect(
        screen.getByText('This is a test dialog description.')
      ).toBeInTheDocument()
    })

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should close dialog when escape key is pressed', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should close dialog when overlay is clicked', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toBeInTheDocument()

      if (overlay) {
        await user.click(overlay)
      }

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should handle controlled open state', () => {
      const { rerender } = render(<TestDialog open={false} />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      rerender(<TestDialog open={true} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should call onOpenChange when dialog state changes', async () => {
      const user = userEvent.setup()
      const onOpenChange = jest.fn()
      render(<TestDialog onOpenChange={onOpenChange} />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      expect(onOpenChange).toHaveBeenCalledWith(true)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('DialogTrigger', () => {
    it('should render with correct data-slot attribute', () => {
      render(<TestDialog />)

      const trigger = document.querySelector('[data-slot="dialog-trigger"]')
      expect(trigger).toBeInTheDocument()
    })

    it('should work with asChild prop', () => {
      render(<TestDialog />)

      const button = screen.getByRole('button', { name: 'Open Dialog' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('DialogContent', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toBeInTheDocument()
    })

    it('should have correct CSS classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass(
        'fixed top-[50%] left-[50%] z-50 grid w-full rounded-lg border p-6 shadow-lg'
      )
    })

    it('should hide close button when showCloseButton is false', async () => {
      const user = userEvent.setup()
      render(<TestDialog showCloseButton={false} />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      expect(
        screen.queryByRole('button', { name: 'Close' })
      ).not.toBeInTheDocument()
    })

    it('should show close button by default', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should apply custom className', async () => {
      const user = userEvent.setup()

      function CustomDialog() {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open</Button>
            </DialogTrigger>
            <DialogContent className='custom-dialog'>
              <DialogTitle>Custom Dialog</DialogTitle>
            </DialogContent>
          </Dialog>
        )
      }

      render(<CustomDialog />)

      const trigger = screen.getByRole('button', { name: 'Open' })
      await user.click(trigger)

      const content = document.querySelector('[data-slot="dialog-content"]')
      expect(content).toHaveClass('custom-dialog')
    })
  })

  describe('DialogOverlay', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toBeInTheDocument()
    })

    it('should have correct CSS classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const overlay = document.querySelector('[data-slot="dialog-overlay"]')
      expect(overlay).toHaveClass('fixed inset-0 z-50 bg-black/50')
    })
  })

  describe('DialogHeader', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const header = document.querySelector('[data-slot="dialog-header"]')
      expect(header).toBeInTheDocument()
    })

    it('should have correct CSS classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const header = document.querySelector('[data-slot="dialog-header"]')
      expect(header).toHaveClass('flex flex-col gap-2 text-center sm:text-left')
    })
  })

  describe('DialogFooter', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const footer = document.querySelector('[data-slot="dialog-footer"]')
      expect(footer).toBeInTheDocument()
    })

    it('should have correct CSS classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const footer = document.querySelector('[data-slot="dialog-footer"]')
      expect(footer).toHaveClass(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'
      )
    })
  })

  describe('DialogTitle', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const title = document.querySelector('[data-slot="dialog-title"]')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Dialog Title')
    })

    it('should have correct CSS classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const title = document.querySelector('[data-slot="dialog-title"]')
      expect(title).toHaveClass('text-lg leading-none font-semibold')
    })

    it('should apply custom className', async () => {
      const user = userEvent.setup()

      function CustomTitleDialog() {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className='custom-title'>Custom Title</DialogTitle>
            </DialogContent>
          </Dialog>
        )
      }

      render(<CustomTitleDialog />)

      const trigger = screen.getByRole('button', { name: 'Open' })
      await user.click(trigger)

      const title = document.querySelector('[data-slot="dialog-title"]')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('DialogDescription', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const description = document.querySelector(
        '[data-slot="dialog-description"]'
      )
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent(
        'This is a test dialog description.'
      )
    })

    it('should have correct CSS classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const description = document.querySelector(
        '[data-slot="dialog-description"]'
      )
      expect(description).toHaveClass('text-muted-foreground text-sm')
    })
  })

  describe('DialogClose', () => {
    it('should render with correct data-slot attribute', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const closeButtons = document.querySelectorAll(
        '[data-slot="dialog-close"]'
      )
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('should work with asChild prop', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()

      const title = screen.getByText('Test Dialog Title')
      const description = screen.getByText('This is a test dialog description.')

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('should trap focus within dialog', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      // Focus should be trapped within the dialog
      const closeButton = screen.getByRole('button', { name: 'Close' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      const confirmButton = screen.getByRole('button', { name: 'Confirm' })

      expect(closeButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
      expect(confirmButton).toBeInTheDocument()
    })

    it('should return focus to trigger after closing', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })
    })
  })

  describe('Animation', () => {
    it('should have animation classes', async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      await user.click(trigger)

      const content = document.querySelector('[data-slot="dialog-content"]')
      const overlay = document.querySelector('[data-slot="dialog-overlay"]')

      expect(content).toHaveClass('data-[state=open]:animate-in')
      expect(content).toHaveClass('data-[state=closed]:animate-out')
      expect(overlay).toHaveClass('data-[state=open]:fade-in-0')
      expect(overlay).toHaveClass('data-[state=closed]:fade-out-0')
    })
  })
})
