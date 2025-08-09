import { render } from '@testing-library/react'

import { Logo } from '../logo'

describe('Logo', () => {
  it('renders logo component', () => {
    const { container } = render(<Logo />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
  })

  it('has correct default dimensions', () => {
    const { container } = render(<Logo />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toHaveAttribute('width', '878')
    expect(svgElement).toHaveAttribute('height', '865')
  })

  it('renders with default Brand component', () => {
    const { container } = render(<Logo />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toHaveClass('size-3')
  })

  it('has correct viewBox', () => {
    const { container } = render(<Logo />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toHaveAttribute('viewBox', '0 0 878 865')
  })

  it('contains path elements', () => {
    const { container } = render(<Logo />)
    const pathElements = container.querySelectorAll('path')
    expect(pathElements.length).toBeGreaterThan(0)
  })
})
