import { render } from '@testing-library/react'

import { Badge } from '../badge'

describe('Badge', () => {
  it('renders badge with default variant', () => {
    const { getByText } = render(<Badge>Default Badge</Badge>)
    expect(getByText('Default Badge')).toBeInTheDocument()
  })

  it('renders badge with secondary variant', () => {
    const { getByText } = render(
      <Badge variant='secondary'>Secondary Badge</Badge>
    )
    const badge = getByText('Secondary Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-secondary')
  })

  it('renders badge with destructive variant', () => {
    const { getByText } = render(
      <Badge variant='destructive'>Destructive Badge</Badge>
    )
    const badge = getByText('Destructive Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-destructive')
  })

  it('renders badge with outline variant', () => {
    const { getByText } = render(<Badge variant='outline'>Outline Badge</Badge>)
    const badge = getByText('Outline Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('border')
  })

  it('applies custom className', () => {
    const { getByText } = render(
      <Badge className='custom-class'>Custom Badge</Badge>
    )
    const badge = getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
  })
})
