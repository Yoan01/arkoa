'use client'

import { ColumnDef } from '@tanstack/react-table'
import { EditIcon, MoreHorizontalIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MembershipWithUserAndBalances } from '@/schemas/edit-leave-balance-dialog-schema'

import { EditLeaveBalanceDialog } from './edit-leave-balance-dialog'

export const hrColumns: ColumnDef<MembershipWithUserAndBalances>[] = [
  {
    accessorKey: 'user.name',
    header: 'Nom',
    cell: ({ row }) => {
      const name = row.original.user.name
      return name || 'Nom non défini'
    },
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ getValue }) => {
      const role = getValue<string>()
      return (
        <Badge variant={role === 'MANAGER' ? 'default' : 'secondary'}>
          {role === 'MANAGER' ? 'Manager' : 'Employé'}
        </Badge>
      )
    },
  },
  {
    id: 'paidLeaveBalance',
    header: 'Congés Payés',
    cell: ({ row }) => {
      const paidLeave = row.original.leaveBalances?.find(
        balance => balance.type === 'PAID'
      )
      return (
        <div className='text-center'>
          <span className='font-medium'>
            {paidLeave?.remainingDays?.toFixed(1) || '0'} jours
          </span>
        </div>
      )
    },
  },
  {
    id: 'rttBalance',
    header: 'RTT',
    cell: ({ row }) => {
      const rttLeave = row.original.leaveBalances?.find(
        balance => balance.type === 'RTT'
      )
      return (
        <div className='text-center'>
          <span className='font-medium'>
            {rttLeave?.remainingDays?.toFixed(1) || '0'} jours
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const membership = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Ouvrir le menu</span>
              <MoreHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <EditLeaveBalanceDialog
              membership={membership}
              trigger={
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <EditIcon className='mr-2 h-4 w-4' />
                  Modifier les congés
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
