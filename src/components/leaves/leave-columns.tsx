'use client'

import 'dayjs/locale/fr' // pour le français

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { MoreHorizontalIcon } from 'lucide-react'

import { Leave, LeaveStatus, LeaveType } from '@/generated/prisma'
import {
  halfDayPeriodLabels,
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
      const start = dayjs(startDate)
      const end = dayjs(endDate)

      if (start.isSame(end, 'day')) {
        return start.format('D MMM YYYY')
      }

      return `${start.format('D MMM YYYY')} – ${end.format('D MMM YYYY')}`
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
    header: 'Durée',
    cell: ({ row }) => {
      const leave = row.original
      const start = dayjs(leave.startDate)
      const end = dayjs(leave.endDate)
      const duration = end.diff(start, 'day') + 1

      if (leave.halfDayPeriod) {
        const periodLabel = halfDayPeriodLabels[leave.halfDayPeriod]
        return `Demi-journée (${periodLabel})`
      }

      return duration === 1 ? '1 jour' : `${duration} jours`
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
