import { render } from '@testing-library/react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'

describe('Table Components', () => {
  it('renders Table component', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('renders TableHeader component', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(container.querySelector('thead')).toBeInTheDocument()
  })

  it('renders TableBody component', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Body</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(container.querySelector('tbody')).toBeInTheDocument()
  })

  it('renders TableRow component', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(container.querySelector('tr')).toBeInTheDocument()
  })

  it('renders TableHead component', () => {
    const { getByText } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(getByText('Column Header')).toBeInTheDocument()
  })

  it('renders TableCell component', () => {
    const { getByText } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(getByText('Cell Content')).toBeInTheDocument()
  })

  it('renders TableCaption component', () => {
    const { getByText } = render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(getByText('Table Caption')).toBeInTheDocument()
  })

  it('renders complete table structure', () => {
    const { getByText } = render(
      <Table>
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(getByText('A list of users')).toBeInTheDocument()
    expect(getByText('Name')).toBeInTheDocument()
    expect(getByText('Email')).toBeInTheDocument()
    expect(getByText('John Doe')).toBeInTheDocument()
    expect(getByText('john@example.com')).toBeInTheDocument()
  })
})
