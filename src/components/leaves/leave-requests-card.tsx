import { Clock, FileTextIcon } from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const LeaveRequestsCard: React.FC = ({}) => {
  const pendingRequests = 3
  const totalRequests = 8
  const approvedRequests = 4
  const progressPercentage = (pendingRequests / totalRequests) * 100

  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardContent className='px-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileTextIcon className='h-5 w-5' />
            <h3 className='font-medium'>Demandes en cours</h3>
          </div>
          <Clock className='h-4 w-4 text-gray-400' />
        </div>

        <div className='space-y-3'>
          <div className='text-3xl font-bold text-orange-400'>
            {pendingRequests} demandes
          </div>

          {/* Barre de progression */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Approuvées: {approvedRequests} demandes</span>
              <span>{totalRequests} demandes total</span>
            </div>
            <Progress
              variant='orange'
              value={progressPercentage}
              className='h-2'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
