'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserRole } from '@/generated/prisma'
import { MembershipWithUserInput } from '@/schemas/queries/membership-with-user-schema'

import { teamColumns } from './team-columns'

export function TeamDataTable() {
  const data = [
    {
      id: '1',
      companyId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      onLeave: false,
      role: UserRole.EMPLOYEE,
      userId: '1',
      user: {
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Antoine Gautier',
        email: 'antoine.gautier@kelkun.app',
        image: null,
        emailVerified: false,
      },
    },
    {
      id: '2',
      companyId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      onLeave: true,
      role: UserRole.EMPLOYEE,
      userId: '2',
      user: {
        id: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Marie Josephine',
        email: 'marie.josephine@kelkun.app',
        image: null,
        emailVerified: false,
      },
    },
  ] as MembershipWithUserInput[]

  const table = useReactTable({
    data: data ?? [],
    columns: teamColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='border-muted/30 overflow-hidden rounded-lg border shadow-sm'>
      <Table className='w-full'>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className=''>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className='px-4 py-2 text-center text-xs font-medium uppercase'
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className='hover:bg-muted/10 transition-colors'
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className={`px-4 py-3 text-center align-middle text-sm`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={teamColumns.length}
                className='text-muted-foreground h-24 text-center'
              >
                Aucun résultat.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
