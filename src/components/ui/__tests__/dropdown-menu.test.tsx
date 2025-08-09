import { render } from '@testing-library/react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu'

describe('DropdownMenu Components', () => {
  it('renders DropdownMenuTrigger', () => {
    const { getByText } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      </DropdownMenu>
    )
    expect(getByText('Open Menu')).toBeInTheDocument()
  })

  it('renders DropdownMenuContent with items', () => {
    const { getByText } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(getByText('Menu Label')).toBeInTheDocument()
    expect(getByText('Item 1')).toBeInTheDocument()
    expect(getByText('Item 2')).toBeInTheDocument()
  })

  it('renders DropdownMenuGroup', () => {
    const { getByText } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Grouped Item</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(getByText('Grouped Item')).toBeInTheDocument()
  })

  it('renders DropdownMenuCheckboxItem', () => {
    const { getByText } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(getByText('Checkbox Item')).toBeInTheDocument()
  })

  it('renders DropdownMenuRadioGroup with RadioItem', () => {
    const { getByText } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value='option1'>
            <DropdownMenuRadioItem value='option1'>
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='option2'>
              Option 2
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
  })

  it('renders DropdownMenuSub with SubTrigger and SubContent', () => {
    const { getByText } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(getByText('Sub Menu')).toBeInTheDocument()
    expect(getByText('Sub Item')).toBeInTheDocument()
  })

  it('renders DropdownMenuShortcut', () => {
    const { getByText } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item with shortcut
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(getByText('⌘K')).toBeInTheDocument()
  })
})
