'use client'

import 'dayjs/locale/fr'

import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { MoreHorizontalIcon } from 'lucide-react'

import { User } from '@/generated/prisma'
import { MembershipWithUserInput } from '@/schemas/queries/membership-with-user-schema'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

dayjs.locale('fr')

const StatusBadge = ({ onLeave }: { onLeave: boolean }) => {
  if (onLeave) {
    return <Badge variant={'secondary'}>En congé</Badge>
  } else {
    return <Badge>Présent</Badge>
  }
}

export const teamColumns: ColumnDef<MembershipWithUserInput>[] = [
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
            <span className='truncate font-medium'>{user.name}</span>
            <span className='text-muted-foreground truncate text-xs'>
              {user.email}
            </span>
          </div>
        </div>
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
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Voir le détail</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
