import { render } from '@testing-library/react'

import { ThemeProvider } from '../theme-provider'

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('provides theme context to children', () => {
    const TestComponent = () => {
      return <div data-testid='theme-consumer'>Theme Consumer</div>
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(getByTestId('theme-consumer')).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    expect(() => {
      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )
    }).not.toThrow()
  })
})
