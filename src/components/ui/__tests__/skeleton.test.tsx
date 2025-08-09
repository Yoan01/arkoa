import { render } from '@testing-library/react'

import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders skeleton component', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className='custom-class' />)
    expect(container.firstChild).toHaveClass('custom-class')
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('renders with default styling', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('rounded-md bg-accent')
  })

  it('can be used as loading placeholder', () => {
    const { container } = render(
      <div>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    )
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(2)
  })
})
