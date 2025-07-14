import { CalendarClockIcon, UsersRoundIcon } from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const ActifMembershipCard: React.FC = ({}) => {
  const totalMembership = 13
  const membershipOnLeave = 4
  const presentMembership = totalMembership - membershipOnLeave

  const presencePercentage = (presentMembership / totalMembership) * 100

  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardContent className='px-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <UsersRoundIcon className='h-5 w-5' />
            <h3 className='font-medium'>Employés actifs</h3>
          </div>
          <CalendarClockIcon className='h-4 w-4 text-gray-400' />
        </div>

        <div className='mb-4 grid grid-cols-2 gap-4 text-center text-sm'>
          <div>
            <div className='text-primary text-lg font-bold'>
              {presentMembership}
            </div>
            <div>Présent</div>
          </div>
          <div>
            <div className='text-lg font-bold text-orange-400'>
              {membershipOnLeave}
            </div>
            <div>En congé</div>
          </div>
        </div>

        <div className='space-y-1'>
          <Progress value={presencePercentage} className='h-2' />
          <p className='text-center text-xs text-gray-500'>
            {Math.round(presencePercentage)}% de l'équipe présente
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
