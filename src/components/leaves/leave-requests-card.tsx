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
      <CardContent className='px-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileTextIcon className='h-5 w-5' />
            <h3 className='font-medium'>Demandes en cours</h3>
          </div>
          <Clock className='h-4 w-4 text-gray-400' />
        </div>

        <div className='mb-4 grid grid-cols-2 gap-4 text-center text-sm lg:grid-cols-4'>
          <div>
            <div className='text-lg font-bold text-orange-400'>
              {pendingRequests}
            </div>
            <div>En attente</div>
          </div>
          <div>
            <div className='text-primary text-lg font-bold'>
              {approvedRequests}
            </div>
            <div>Approuvées</div>
          </div>
          <div>
            <div className='text-lg font-bold text-red-500'>
              {rejectedRequests}
            </div>
            <div>Rejetées</div>
          </div>
          <div>
            <div className='text-lg font-bold'>{canceledRequests}</div>
            <div>Annulées</div>
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
