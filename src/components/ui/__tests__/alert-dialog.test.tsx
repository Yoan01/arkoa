import { render } from '@testing-library/react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog'

describe('AlertDialog Components', () => {
  it('renders AlertDialogTrigger', () => {
    const { getByText } = render(
      <AlertDialog>
        <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
      </AlertDialog>
    )
    expect(getByText('Open Dialog')).toBeInTheDocument()
  })

  it('renders AlertDialogContent with header and footer', () => {
    const { getByText } = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Title</AlertDialogTitle>
            <AlertDialogDescription>Test Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    expect(getByText('Test Title')).toBeInTheDocument()
    expect(getByText('Test Description')).toBeInTheDocument()
    expect(getByText('Cancel')).toBeInTheDocument()
    expect(getByText('Continue')).toBeInTheDocument()
  })

  it('renders AlertDialogAction with custom className', () => {
    const { getByText } = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogAction className='custom-action'>
              Action
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    const actionButton = getByText('Action')
    expect(actionButton).toHaveClass('custom-action')
  })

  it('renders AlertDialogCancel with custom className', () => {
    const { getByText } = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel className='custom-cancel'>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    const cancelButton = getByText('Cancel')
    expect(cancelButton).toHaveClass('custom-cancel')
  })
})
