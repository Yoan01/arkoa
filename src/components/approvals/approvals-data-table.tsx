'use client'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetCompanyLeaves } from '@/hooks/api/leaves/get-company-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

import { approvalsColumns } from './approvals-columns'

export const ApprovalsDataTable: React.FC = () => {
  const { activeCompany } = useCompanyStore()
  const { data: leaves = [], isLoading } = useGetCompanyLeaves({
    companyId: activeCompany?.id || '',
  })

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [globalFilter, setGlobalFilter] = useState('')

  // Filtrer les données selon le statut sélectionné
  const filteredData = React.useMemo(() => {
    if (statusFilter === 'all') return leaves
    return leaves.filter(leave => leave.status === statusFilter)
  }, [leaves, statusFilter])

  const table = useReactTable({
    data: filteredData,
    columns: approvalsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approbation des Congés</CardTitle>
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
        <CardTitle>Approbation des Congés</CardTitle>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
            <Input
              placeholder='Rechercher un employé...'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className='max-w-sm'
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filtrer par statut' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tous les statuts</SelectItem>
                <SelectItem value='PENDING'>En attente</SelectItem>
                <SelectItem value='APPROVED'>Approuvées</SelectItem>
                <SelectItem value='REJECTED'>Rejetées</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='text-muted-foreground text-sm'>
            {filteredData.length} demande(s) trouvée(s)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
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
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
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
                    colSpan={approvalsColumns.length}
                    className='h-24 text-center'
                  >
                    Aucune demande de congé trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
