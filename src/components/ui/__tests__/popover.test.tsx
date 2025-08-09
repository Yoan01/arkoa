import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '../popover'

describe('Popover Components', () => {
  it('imports Popover components without errors', () => {
    expect(Popover).toBeDefined()
    expect(PopoverContent).toBeDefined()
    expect(PopoverTrigger).toBeDefined()
    expect(PopoverAnchor).toBeDefined()
  })

  it('PopoverAnchor component is defined', () => {
    expect(PopoverAnchor).toBeDefined()
    expect(typeof PopoverAnchor).toBe('function')
  })
})
