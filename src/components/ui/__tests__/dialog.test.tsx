import { render } from '@testing-library/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

describe('Dialog Components', () => {
  it('imports Dialog components without errors', () => {
    expect(Dialog).toBeDefined()
    expect(DialogContent).toBeDefined()
    expect(DialogDescription).toBeDefined()
    expect(DialogFooter).toBeDefined()
    expect(DialogHeader).toBeDefined()
    expect(DialogTitle).toBeDefined()
    expect(DialogTrigger).toBeDefined()
  })

  it('renders DialogHeader with custom className', () => {
    const { container } = render(
      <DialogHeader className='custom-header'>
        <div>Header content</div>
      </DialogHeader>
    )
    const headerElement = container.querySelector('[data-slot="dialog-header"]')
    expect(headerElement).toBeInTheDocument()
    expect(headerElement).toHaveClass('custom-header')
  })

  it('renders DialogFooter with custom className', () => {
    const { container } = render(
      <DialogFooter className='custom-footer'>Footer content</DialogFooter>
    )
    const footerElement = container.querySelector('[data-slot="dialog-footer"]')
    expect(footerElement).toBeInTheDocument()
    expect(footerElement).toHaveClass('custom-footer')
  })
})
