'use client'

import 'dayjs/locale/fr'

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

import { LeaveStatus, LeaveType } from '@/generated/prisma'
import {
  halfDayPeriodLabels,
  leaveStatusColors,
  leaveStatusLabels,
  leaveTypeLabels,
} from '@/lib/constants'
import { CompanyLeave } from '@/schemas/queries/company-leaves-schema'

import { ApprovalActions } from './review-leave-dialog'

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

export const approvalsColumns: ColumnDef<CompanyLeave>[] = [
  {
    accessorKey: 'membership.user.name',
    header: 'Employé',
    cell: ({ row }) => {
      const name = row.original?.membership?.user?.name
      return name || 'N/A'
    },
  },
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
      const startDate = dayjs(row.original.startDate).format('D MMM')
      const endDate = dayjs(row.original.endDate).format('D MMM YYYY')
      return `${startDate} - ${endDate}`
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
    accessorKey: 'reason',
    header: 'Motif',
    cell: ({ getValue }) => {
      const reason = getValue<string>()
      return reason || '-'
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ getValue }) => {
      return <StatusBadge status={getValue<LeaveStatus>()} />
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Demandé le',
    cell: ({ getValue }) => dayjs(getValue<string>()).format('D MMM YYYY'),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => {
      return <ApprovalActions leave={row.original} />
    },
  },
]
