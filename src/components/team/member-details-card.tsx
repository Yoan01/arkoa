'use client'

import {
  ArrowLeftIcon,
  BuildingIcon,
  ClockIcon,
  MailIcon,
  UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMembership } from '@/hooks/api/memberships/get-membership'
import { useCompanyStore } from '@/stores/use-company-store'

import { Button } from '../ui/button'

interface MemberDetailsCardProps {
  membershipId: string
}

export function MemberDetailsCard({ membershipId }: MemberDetailsCardProps) {
  const router = useRouter()
  const { activeCompany } = useCompanyStore()
  const {
    data: membership,
    isLoading,
    error,
  } = useGetMembership(activeCompany?.id || '', membershipId)

  if (isLoading) {
    return (
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            <UserIcon className='text-primary h-5 w-5' />
            Détails du Salarié
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </div>
            <Skeleton className='h-6 w-16' />
          </div>
          <div className='space-y-3'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-2/3' />
          </div>
          <div className='space-y-3'>
            <Skeleton className='h-4 w-1/2' />
            <div className='grid grid-cols-1 gap-2'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !membership) {
    return (
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            <UserIcon className='text-primary h-5 w-5' />
            Détails du Salarié
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground py-4 text-center text-sm'>
            {error?.message || 'Impossible de charger les détails du membre'}
          </p>
        </CardContent>
      </Card>
    )
  }
  const { user, company, role, createdAt } = membership

  const getRoleLabel = (role: string) => {
    return role === 'MANAGER' ? 'Manager' : 'Employé'
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'MANAGER' ? 'default' : 'secondary'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardHeader>
        <div>
          <Button variant={'secondary'} size='sm' onClick={() => router.back()}>
            <ArrowLeftIcon className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Informations personnelles */}
        <div className='flex items-center gap-4'>
          <Avatar className='h-16 w-16'>
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className='text-lg'>
              {user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h3 className='text-foreground text-xl font-semibold'>
              {user.name}
            </h3>
            <div className='text-muted-foreground flex items-center gap-2'>
              <MailIcon className='h-4 w-4' />
              <span>{user.email}</span>
            </div>
          </div>
          <Badge variant={getRoleBadgeVariant(role)}>
            {getRoleLabel(role)}
          </Badge>
        </div>

        {/* Informations entreprise */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-sm'>
            <BuildingIcon className='h-4 w-4 text-blue-500' />
            <span className='font-medium'>Entreprise:</span>
            <span className='text-muted-foreground'>{company.name}</span>
          </div>

          <div className='flex items-center gap-2 text-sm'>
            <ClockIcon className='h-4 w-4 text-green-500' />
            <span className='font-medium'>Membre depuis:</span>
            <span className='text-muted-foreground'>
              {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
