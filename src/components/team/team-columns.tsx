'use client'

import { ColumnDef } from '@tanstack/react-table'

import { User } from '@/generated/prisma'
import dayjs from '@/lib/dayjs-config'
import { MembershipWithUserAndBalances } from '@/schemas/edit-leave-balance-dialog-schema'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

const StatusBadge = ({ onLeave }: { onLeave: boolean }) => {
  if (onLeave) {
    return <Badge variant={'secondary'}>En congé</Badge>
  } else {
    return <Badge>Présent</Badge>
  }
}

export const teamColumns: ColumnDef<MembershipWithUserAndBalances>[] = [
  {
    accessorKey: 'user',
    header: 'Employé',
    cell: ({ getValue }) => {
      const user = getValue<User>()
      return (
        <div className='inline-flex items-center gap-2 px-1 py-1.5 text-sm'>
          <Avatar className='h-8 w-8 rounded-lg'>
            <AvatarImage src={user.image ?? ''} alt={user.name} />
            <AvatarFallback className='rounded-lg'>
              {user.name
                ?.split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='font-medium'>{user.name}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <a
          href={`mailto:${user.email}`}
          className='text-muted-foreground hover:text-primary text-sm transition-colors hover:underline'
        >
          {user.email}
        </a>
      )
    },
  },
  {
    accessorKey: 'onLeave',
    header: 'Statut',
    cell: ({ getValue }) => {
      const value = getValue<boolean>()
      return <StatusBadge onLeave={value} />
    },
  },
  {
    id: 'phone',
    header: 'Télélphone',
    cell: ({ row }) => {
      const { user: _user } = row.original
      return 'Non renseigné'
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Ajouté le',
    cell: ({ getValue }) => dayjs(getValue<string>()).format('D MMM YYYY'),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => {
      const membership = row.original
      return (
        <Button
          variant='outline'
          size='sm'
          onClick={() => (window.location.href = `/team/${membership.id}`)}
        >
          Voir le détail
        </Button>
      )
    },
  },
]
