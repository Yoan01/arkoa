'use client'

import { HistoryIcon } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetLeaveBalanceHistory } from '@/hooks/api/leave-balances/get-leave-balance-history'
import dayjs from '@/lib/dayjs-config'
interface MemberLeaveHistoryCardProps {
  membershipId: string
}

export const MemberLeaveHistoryCard: React.FC<MemberLeaveHistoryCardProps> = ({
  membershipId,
}) => {
  const { data: history, isLoading } = useGetLeaveBalanceHistory(membershipId)

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return 'Congés annuels'
      case 'SICK':
        return 'Congés maladie'
      case 'PERSONAL':
        return 'Congés personnels'
      case 'RTT':
        return 'RTT'
      default:
        return type
    }
  }

  const getChangeVariant = (change: number) => {
    if (change > 0) return 'default'
    if (change < 0) return 'destructive'
    return 'secondary'
  }

  const formatChange = (change: number) => {
    if (change > 0) return `+${change}`
    return change.toString()
  }

  const formatDate = (dateString: Date) => {
    return dayjs(dateString).format('DD MMM YYYY à HH:mm')
  }

  if (isLoading) {
    return (
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            <HistoryIcon className='text-primary h-5 w-5' />
            Historique des Congés
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3'>
          <HistoryIcon className='text-primary h-5 w-5' />
          Historique des Congés
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!history || history.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center'>
            Aucun historique de congés disponible.
          </p>
        ) : (
          <div className='space-y-4'>
            {history.map(item => (
              <div
                key={item.id}
                className='bg-muted/50 flex items-start justify-between rounded-lg p-4'
              >
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>
                      {getLeaveTypeLabel(item.leaveBalance.type)}
                    </span>
                    <Badge variant={getChangeVariant(item.change)}>
                      {formatChange(item.change)} jour
                      {Math.abs(item.change) !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {item.reason && (
                    <p className='text-muted-foreground text-sm'>
                      Motif: {item.reason}
                    </p>
                  )}

                  <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.actor && (
                      <>
                        <span>•</span>
                        <span>Par {item.actor.name || item.actor.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
