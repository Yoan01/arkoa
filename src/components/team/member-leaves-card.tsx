'use client'

import dayjs from 'dayjs'
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMembershipLeaves } from '@/hooks/api/leaves/get-membership-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

interface MemberLeavesCardProps {
  membershipId: string
}

export function MemberLeavesCard({ membershipId }: MemberLeavesCardProps) {
  const { activeCompany } = useCompanyStore()
  const {
    data: leaves = [],
    isLoading: loading,
    error,
  } = useGetMembershipLeaves(activeCompany?.id ?? '', membershipId)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className='h-4 w-4 text-green-500' />
      case 'REJECTED':
        return <XCircleIcon className='h-4 w-4 text-red-500' />
      case 'PENDING':
      default:
        return <AlertCircleIcon className='h-4 w-4 text-orange-500' />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approuvé'
      case 'REJECTED':
        return 'Rejeté'
      case 'PENDING':
      default:
        return 'En attente'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default' as const
      case 'REJECTED':
        return 'destructive' as const
      case 'PENDING':
      default:
        return 'secondary' as const
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return 'Congés annuels'
      case 'SICK':
        return 'Congés maladie'
      case 'PERSONAL':
        return 'Congés personnels'
      default:
        return type
    }
  }

  const formatDate = (dateString: Date) => {
    return dayjs(dateString).format('DD MMM YYYY')
  }

  const calculateDuration = (startDate: Date, endDate: Date) => {
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    return end.diff(start, 'day') + 1
  }

  if (loading) {
    return (
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            <CalendarIcon className='text-primary h-5 w-5' />
            Congés Récents
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            <CalendarIcon className='text-primary h-5 w-5' />
            Congés Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground py-4 text-center text-sm'>
            {error.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3'>
          <CalendarIcon className='text-primary h-5 w-5' />
          Congés Récents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaves.length === 0 ? (
          <p className='text-muted-foreground py-4 text-center text-sm'>
            Aucun congé enregistré
          </p>
        ) : (
          <div className='space-y-4'>
            {leaves.slice(0, 5).map(leave => (
              <div
                key={leave.id}
                className='bg-muted/50 flex items-start justify-between rounded-lg p-4'
              >
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>
                      {getLeaveTypeLabel(leave.type)}
                    </span>
                    <Badge variant={getStatusVariant(leave.status)}>
                      {getStatusIcon(leave.status)}
                      <span className='ml-1'>
                        {getStatusLabel(leave.status)}
                      </span>
                    </Badge>
                  </div>

                  <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                    <div className='flex items-center gap-1'>
                      <ClockIcon className='h-3 w-3' />
                      <span>
                        {formatDate(leave.startDate)} -{' '}
                        {formatDate(leave.endDate)}
                      </span>
                    </div>
                    <span>
                      {calculateDuration(leave.startDate, leave.endDate)} jour
                      {calculateDuration(leave.startDate, leave.endDate) !== 1
                        ? 's'
                        : ''}
                    </span>
                  </div>

                  {leave.reason && (
                    <p className='text-muted-foreground text-xs'>
                      <span className='font-medium'>Raison:</span>{' '}
                      {leave.reason}
                    </p>
                  )}

                  {leave.managerNote && (
                    <p className='text-muted-foreground text-xs'>
                      <span className='font-medium'>Note du manager:</span>{' '}
                      {leave.managerNote}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {leaves.length > 5 && (
              <p className='text-muted-foreground pt-2 text-center text-xs'>
                Et {leaves.length - 5} autre{leaves.length - 5 !== 1 ? 's' : ''}{' '}
                congé{leaves.length - 5 !== 1 ? 's' : ''}...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
