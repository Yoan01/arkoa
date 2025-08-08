import { Clock, FileTextIcon } from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const LeaveRequestsCard: React.FC = () => {
  const pendingRequests = 3
  const approvedRequests = 5
  const rejectedRequests = 2
  const canceledRequests = 1
  const totalRequests =
    pendingRequests + approvedRequests + rejectedRequests + canceledRequests

  const approvedPercentage = (approvedRequests / totalRequests) * 100

  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardContent className='px-4 sm:px-6'>
        <div className='mb-3 flex items-center justify-between sm:mb-4'>
          <div className='flex items-center gap-2'>
            <FileTextIcon className='h-4 w-4 sm:h-5 sm:w-5' />
            <h3 className='text-sm font-medium sm:text-base'>
              Demandes en cours
            </h3>
          </div>
          <Clock className='h-3 w-3 text-gray-400 sm:h-4 sm:w-4' />
        </div>

        <div className='mb-3 grid grid-cols-2 gap-2 text-center text-xs sm:mb-4 sm:gap-4 sm:text-sm lg:grid-cols-4'>
          <div>
            <div className='text-base font-bold text-orange-400 sm:text-lg'>
              {pendingRequests}
            </div>
            <div className='text-xs sm:text-sm'>En attente</div>
          </div>
          <div>
            <div className='text-primary text-base font-bold sm:text-lg'>
              {approvedRequests}
            </div>
            <div className='text-xs sm:text-sm'>Approuvées</div>
          </div>
          <div>
            <div className='text-base font-bold text-red-500 sm:text-lg'>
              {rejectedRequests}
            </div>
            <div className='text-xs sm:text-sm'>Rejetées</div>
          </div>
          <div>
            <div className='text-base font-bold sm:text-lg'>
              {canceledRequests}
            </div>
            <div className='text-xs sm:text-sm'>Annulées</div>
          </div>
        </div>

        <div className='space-y-1'>
          <Progress value={approvedPercentage} className='h-2' />
          <p className='text-center text-xs text-gray-500'>
            {Math.round(approvedPercentage)}% des demandes approuvées
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
