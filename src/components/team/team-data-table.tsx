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
import { useGetMemberships } from '@/hooks/api/memberships/get-memberships'
import { useCompanyStore } from '@/stores/use-company-store'

import { teamColumns } from './team-columns'

export function TeamDataTable() {
  const { activeCompany } = useCompanyStore()
  const {
    data: memberships,
    isLoading,
    error,
  } = useGetMemberships(activeCompany?.id || '')

  const data = memberships || []

  const table = useReactTable({
    data: data ?? [],
    columns: teamColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground text-sm'>
          Chargement des membres...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-destructive text-sm'>
          Erreur lors du chargement des membres
        </div>
      </div>
    )
  }

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
