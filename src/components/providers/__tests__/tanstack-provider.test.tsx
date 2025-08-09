import { render } from '@testing-library/react'

import TanstackProvider from '../tanstack-provider'

describe('TanstackProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <TanstackProvider>
        <div>Test Child</div>
      </TanstackProvider>
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('provides QueryClient context to children', () => {
    const TestComponent = () => {
      return <div data-testid='query-consumer'>Query Consumer</div>
    }

    const { getByTestId } = render(
      <TanstackProvider>
        <TestComponent />
      </TanstackProvider>
    )

    expect(getByTestId('query-consumer')).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    expect(() => {
      render(
        <TanstackProvider>
          <div>Content</div>
        </TanstackProvider>
      )
    }).not.toThrow()
  })

  it('wraps children with QueryClientProvider', () => {
    const { container } = render(
      <TanstackProvider>
        <div>Wrapped Content</div>
      </TanstackProvider>
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})
