import {
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const HrStatsCards: React.FC = () => {
  // Ces données seront récupérées via des hooks API plus tard
  const stats = {
    totalEmployees: 13,
    employeesOnLeave: 4,
    pendingRequests: 7,
    averageLeaveBalance: 22.5,
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Employés</CardTitle>
          <UsersIcon className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalEmployees}</div>
          <p className='text-muted-foreground text-xs'>Employés actifs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>En Congé</CardTitle>
          <CalendarIcon className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.employeesOnLeave}</div>
          <p className='text-muted-foreground text-xs'>Actuellement absents</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Demandes en Attente
          </CardTitle>
          <ClockIcon className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.pendingRequests}</div>
          <p className='text-muted-foreground text-xs'>À traiter</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Solde Moyen</CardTitle>
          <TrendingUpIcon className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.averageLeaveBalance}</div>
          <p className='text-muted-foreground text-xs'>Jours de congés</p>
        </CardContent>
      </Card>
    </div>
  )
}
