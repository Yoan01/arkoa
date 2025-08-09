import { render } from '@testing-library/react'

import Brand from '../brand'

describe('Brand', () => {
  it('renders brand component', () => {
    const { container } = render(<Brand />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders with correct styling', () => {
    const { container } = render(<Brand />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toHaveAttribute('viewBox', '0 0 878 865')
  })

  it('applies custom className', () => {
    const { container } = render(<Brand className='custom-class' />)
    const svgElement = container.querySelector('svg')
    expect(svgElement).toHaveClass('custom-class')
  })

  it('renders as an SVG element', () => {
    const { container } = render(<Brand />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
