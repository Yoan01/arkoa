'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

import { hrColumns } from './hr-columns'

export const HrDataTable: React.FC = () => {
  const { activeCompany } = useCompanyStore()
  const { data: memberships = [], isLoading } = useGetMemberships(
    activeCompany?.id || ''
  )

  const table = useReactTable({
    data: memberships,
    columns: hrColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Congés Employés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>Chargement...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Congés Employés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          {/* Table responsive avec scroll horizontal sur mobile */}
          <div className='overflow-x-auto'>
            <Table className='min-w-[700px]'>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        className='px-2 py-2 text-center text-xs font-medium uppercase sm:px-4'
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
                          className='px-2 py-3 text-center align-middle text-xs sm:px-4 sm:text-sm'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={hrColumns.length}
                      className='text-muted-foreground h-24 text-center'
                    >
                      Aucun employé trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
