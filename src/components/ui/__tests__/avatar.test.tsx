import { render } from '@testing-library/react'

import { Avatar, AvatarFallback, AvatarImage } from '../avatar'

describe('Avatar', () => {
  it('renders avatar component', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src='/test-image.jpg' alt='Test' />
        <AvatarFallback>TB</AvatarFallback>
      </Avatar>
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders fallback when image fails to load', () => {
    const { getByText } = render(
      <Avatar>
        <AvatarImage src='/invalid-image.jpg' alt='Test' />
        <AvatarFallback>TB</AvatarFallback>
      </Avatar>
    )
    expect(getByText('TB')).toBeInTheDocument()
  })

  it('renders Avatar with fallback', () => {
    const { getByText } = render(
      <Avatar>
        <AvatarFallback>TB</AvatarFallback>
      </Avatar>
    )
    expect(getByText('TB')).toBeInTheDocument()
  })
})
