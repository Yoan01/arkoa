import { render } from '@testing-library/react'

import { Progress } from '../progress'

describe('Progress', () => {
  it('renders progress component', () => {
    const { container } = render(<Progress value={50} />)
    const progressElement = container.querySelector('[role="progressbar"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('displays correct value', () => {
    const { container } = render(<Progress value={75} />)
    const progressElement = container.querySelector('[data-slot="progress"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('handles zero value', () => {
    const { container } = render(<Progress value={0} />)
    const progressElement = container.querySelector('[data-slot="progress"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('handles maximum value', () => {
    const { container } = render(<Progress value={100} />)
    const progressElement = container.querySelector('[data-slot="progress"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('handles undefined value', () => {
    const { container } = render(<Progress />)
    const progressElement = container.querySelector('[data-slot="progress"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Progress value={50} className='custom-class' />
    )
    const progressElement = container.querySelector('[role="progressbar"]')
    expect(progressElement).toHaveClass('custom-class')
  })

  it('sets correct transform style for progress indicator', () => {
    const { container } = render(<Progress value={60} />)
    const indicator = container.querySelector(
      '[data-slot="progress-indicator"]'
    )
    expect(indicator).toHaveStyle('transform: translateX(-40%)')
  })
})
