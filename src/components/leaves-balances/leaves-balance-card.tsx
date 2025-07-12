import { Calendar, Clock } from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const LeaveBalanceCard: React.FC = ({}) => {
  const remainingDays = 25.5
  const totalDays = 30
  const usedDays = totalDays - remainingDays
  const progressPercentage = (usedDays / totalDays) * 100
  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardContent className='px-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            <h3 className='font-medium'>Congés restants</h3>
          </div>
          <Clock className='h-4 w-4 text-gray-400' />
        </div>

        <div className='space-y-3'>
          <div className='text-primary text-3xl font-bold'>
            {remainingDays} jours
          </div>

          {/* Barre de progression */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Utilisés: {usedDays} jours</span>
              <span>{totalDays} jours total</span>
            </div>
            <Progress value={100 - progressPercentage} className='h-2' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
