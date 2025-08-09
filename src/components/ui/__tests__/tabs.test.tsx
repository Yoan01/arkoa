import { render } from '@testing-library/react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

describe('Tabs Components', () => {
  it('renders Tabs with TabsList and TabsTrigger', () => {
    const { getByText } = render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(getByText('Tab 1')).toBeInTheDocument()
    expect(getByText('Tab 2')).toBeInTheDocument()
  })

  it('renders TabsContent for active tab', () => {
    const { getByText } = render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>
          <div>Content for Tab 1</div>
        </TabsContent>
        <TabsContent value='tab2'>
          <div>Content for Tab 2</div>
        </TabsContent>
      </Tabs>
    )
    expect(getByText('Content for Tab 1')).toBeInTheDocument()
  })

  it('imports Tabs components without errors', () => {
    expect(Tabs).toBeDefined()
    expect(TabsContent).toBeDefined()
    expect(TabsList).toBeDefined()
    expect(TabsTrigger).toBeDefined()
  })

  it('renders TabsList with custom className', () => {
    const { container } = render(
      <Tabs defaultValue='tab1'>
        <TabsList className='custom-list'>
          <div>List content</div>
        </TabsList>
      </Tabs>
    )
    const listElement = container.querySelector('[data-slot="tabs-list"]')
    expect(listElement).toBeInTheDocument()
    expect(listElement).toHaveClass('custom-list')
  })

  it('renders TabsContent with custom className', () => {
    const { container } = render(
      <Tabs defaultValue='tab1'>
        <TabsContent value='tab1' className='custom-content'>
          Tab content
        </TabsContent>
      </Tabs>
    )
    const contentElement = container.querySelector('[data-slot="tabs-content"]')
    expect(contentElement).toBeInTheDocument()
    expect(contentElement).toHaveClass('custom-content')
    expect(contentElement).toHaveTextContent('Tab content')
  })

  it('applies correct default styling to TabsList', () => {
    const { container } = render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const listElement = container.querySelector('[data-slot="tabs-list"]')
    expect(listElement).toHaveClass('bg-muted')
    expect(listElement).toHaveClass('text-muted-foreground')
    expect(listElement).toHaveClass('inline-flex')
  })
})
