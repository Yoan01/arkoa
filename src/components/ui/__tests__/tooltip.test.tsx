import { render } from '@testing-library/react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip'

describe('Tooltip Components', () => {
  it('imports Tooltip components without errors', () => {
    expect(Tooltip).toBeDefined()
    expect(TooltipContent).toBeDefined()
    expect(TooltipProvider).toBeDefined()
    expect(TooltipTrigger).toBeDefined()
  })

  it('renders TooltipProvider without errors', () => {
    const { container } = render(
      <TooltipProvider>
        <div>Provider content</div>
      </TooltipProvider>
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
