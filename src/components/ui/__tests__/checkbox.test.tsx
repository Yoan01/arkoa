import { fireEvent, render } from '@testing-library/react'

import { Checkbox } from '../checkbox'

describe('Checkbox', () => {
  it('renders checkbox component', () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('button')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute('role', 'checkbox')
  })

  it('handles checked state', () => {
    const { container } = render(<Checkbox checked />)
    const checkbox = container.querySelector('button')
    expect(checkbox).toHaveAttribute('data-state', 'checked')
  })

  it('handles unchecked state', () => {
    const { container } = render(<Checkbox checked={false} />)
    const checkbox = container.querySelector('button')
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  it('handles disabled state', () => {
    const { container } = render(<Checkbox disabled />)
    const checkbox = container.querySelector('button')
    expect(checkbox).toBeDisabled()
  })

  it('calls onCheckedChange when clicked', () => {
    const onCheckedChange = jest.fn()
    const { container } = render(<Checkbox onCheckedChange={onCheckedChange} />)
    const checkbox = container.querySelector('button')

    if (checkbox) {
      fireEvent.click(checkbox)
      expect(onCheckedChange).toHaveBeenCalled()
    }
  })

  it('applies custom className', () => {
    const { container } = render(<Checkbox className='custom-class' />)
    const checkbox = container.querySelector('button')
    expect(checkbox).toHaveClass('custom-class')
  })
})
