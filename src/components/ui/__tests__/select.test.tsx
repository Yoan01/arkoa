import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../select'

describe('Select Components', () => {
  it('imports Select components without errors', () => {
    expect(Select).toBeDefined()
    expect(SelectContent).toBeDefined()
    expect(SelectGroup).toBeDefined()
    expect(SelectItem).toBeDefined()
    expect(SelectLabel).toBeDefined()
    expect(SelectSeparator).toBeDefined()
    expect(SelectTrigger).toBeDefined()
    expect(SelectValue).toBeDefined()
  })
})
