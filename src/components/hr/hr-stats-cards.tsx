'use client'
import {
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetCompanyStats } from '@/hooks/api/companies/get-company-stats'
import { useCompanyStore } from '@/stores/use-company-store'

export const HrStatsCards: React.FC = () => {
  const { activeCompany } = useCompanyStore()
  const {
    data: stats,
    isLoading,
    error,
  } = useGetCompanyStats(activeCompany?.id)

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
              <div className='h-4 w-4 animate-pulse rounded bg-gray-200' />
            </CardHeader>
            <CardContent>
              <div className='h-8 w-16 animate-pulse rounded bg-gray-200' />
              <div className='mt-1 h-3 w-24 animate-pulse rounded bg-gray-200' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='col-span-full'>
          <CardContent className='pt-6'>
            <p className='text-center text-red-600'>
              Erreur lors du chargement des statistiques
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card className='shadow-sm transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Employés</CardTitle>
          <UsersIcon className='h-5 w-5 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold text-blue-600'>
            {stats.totalEmployees}
          </div>
          <p className='text-muted-foreground text-xs'>Employés actifs</p>
        </CardContent>
      </Card>

      <Card className='shadow-sm transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>En Congé</CardTitle>
          <CalendarIcon className='text-primary/80 h-5 w-5' />
        </CardHeader>
        <CardContent>
          <div className='text-primary text-3xl font-bold'>
            {stats.employeesOnLeave}
          </div>
          <p className='text-muted-foreground text-xs'>Actuellement absents</p>
        </CardContent>
      </Card>

      <Card className='shadow-sm transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Demandes en Attente
          </CardTitle>
          <ClockIcon className='h-5 w-5 text-orange-400' />
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold text-orange-500'>
            {stats.pendingRequests}
          </div>
          <p className='text-muted-foreground text-xs'>À traiter</p>
        </CardContent>
      </Card>

      <Card className='shadow-sm transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Solde Moyen</CardTitle>
          <TrendingUpIcon className='h-5 w-5 text-purple-500' />
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold text-purple-600'>
            {stats.averageLeaveBalance}
          </div>
          <p className='text-muted-foreground text-xs'>Jours de congés payés</p>
        </CardContent>
      </Card>
    </div>
  )
}
