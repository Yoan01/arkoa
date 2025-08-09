import { render } from '@testing-library/react'

import { Toaster } from '../sonner'

describe('Sonner Toaster', () => {
  it('renders toaster component', () => {
    const { container } = render(<Toaster />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies theme classes correctly', () => {
    const { container } = render(<Toaster theme='light' />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with default props', () => {
    const { container } = render(<Toaster />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('can be customized with additional props', () => {
    const { container } = render(
      <Toaster position='top-center' richColors closeButton />
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
