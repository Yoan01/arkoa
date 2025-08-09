import { render } from '@testing-library/react'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../sheet'

describe('Sheet Components', () => {
  it('imports Sheet components without errors', () => {
    expect(Sheet).toBeDefined()
    expect(SheetClose).toBeDefined()
    expect(SheetContent).toBeDefined()
    expect(SheetDescription).toBeDefined()
    expect(SheetFooter).toBeDefined()
    expect(SheetHeader).toBeDefined()
    expect(SheetTitle).toBeDefined()
    expect(SheetTrigger).toBeDefined()
  })

  it('renders SheetHeader with custom className', () => {
    const { container } = render(
      <SheetHeader className='custom-header'>
        <div>Header content</div>
      </SheetHeader>
    )
    const headerElement = container.querySelector('[data-slot="sheet-header"]')
    expect(headerElement).toBeInTheDocument()
    expect(headerElement).toHaveClass('custom-header')
  })

  it('renders SheetFooter with custom className', () => {
    const { container } = render(
      <SheetFooter className='custom-footer'>
        <div>Footer content</div>
      </SheetFooter>
    )
    const footerElement = container.querySelector('[data-slot="sheet-footer"]')
    expect(footerElement).toBeInTheDocument()
    expect(footerElement).toHaveClass('custom-footer')
  })
})
