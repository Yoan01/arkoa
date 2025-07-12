'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Leave } from '@/generated/prisma'

export const leaveColumns: ColumnDef<Leave>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
  },
]
