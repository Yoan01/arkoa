import { render } from '@testing-library/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card'

describe('Card Components', () => {
  it('renders Card component', () => {
    const { container } = render(<Card>Card content</Card>)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('rounded-xl border bg-card')
  })

  it('renders CardHeader component', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    )
    expect(getByText('Header content')).toBeInTheDocument()
  })

  it('renders CardTitle component', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(getByText('Card Title')).toBeInTheDocument()
  })

  it('renders CardDescription component', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(getByText('Card description')).toBeInTheDocument()
  })

  it('renders CardContent component', () => {
    const { getByText } = render(
      <Card>
        <CardContent>Content here</CardContent>
      </Card>
    )
    expect(getByText('Content here')).toBeInTheDocument()
  })

  it('renders CardFooter component', () => {
    const { getByText } = render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    expect(getByText('Footer content')).toBeInTheDocument()
  })

  it('renders complete card structure', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    )

    expect(getByText('Test Title')).toBeInTheDocument()
    expect(getByText('Test Description')).toBeInTheDocument()
    expect(getByText('Test Content')).toBeInTheDocument()
    expect(getByText('Test Footer')).toBeInTheDocument()
  })
})
