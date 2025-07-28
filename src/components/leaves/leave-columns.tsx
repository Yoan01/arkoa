'use client'

import 'dayjs/locale/fr' // pour le français

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { MoreHorizontalIcon } from 'lucide-react'

import { Leave, LeaveStatus, LeaveType } from '@/generated/prisma'
import {
  leaveStatusColors,
  leaveStatusLabels,
  leaveTypeLabels,
} from '@/lib/constants'

import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { AddLeaveDialog } from './add-leave-dialog'

dayjs.locale('fr')

const StatusBadge = ({ status }: { status: LeaveStatus }) => {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        leaveStatusColors[status] ?? 'bg-gray-200 text-gray-600'
      }`}
    >
      {leaveStatusLabels[status]}
    </span>
  )
}

export const leaveColumns: ColumnDef<Leave>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => {
      const value = getValue<LeaveType>()
      return leaveTypeLabels[value] ?? value
    },
  },
  {
    id: 'period',
    header: 'Période',
    cell: ({ row }) => {
      const { startDate, endDate } = row.original
      return `${dayjs(startDate).format('D MMM YYYY')} – ${dayjs(endDate).format('D MMM YYYY')}`
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ getValue }) => {
      const value = getValue<LeaveStatus>()
      return <StatusBadge status={value} />
    },
  },
  {
    id: 'duration',
    header: 'Durée (jours)',
    cell: ({ row }) => {
      const { startDate, endDate } = row.original
      return dayjs(endDate).diff(dayjs(startDate), 'day') + 1
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Créé le',
    cell: ({ getValue }) => dayjs(getValue<string>()).format('D MMM YYYY'),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const leave = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <AddLeaveDialog
              trigger={
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  Modifier
                </DropdownMenuItem>
              }
              leave={leave}
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem>Voir le détail</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
