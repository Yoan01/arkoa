'use client'

import { CheckCircle, Clock, XCircle } from 'lucide-react'
import React from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { useGetLeaveStats } from '@/hooks/api/leaves/get-leave-stats'
import { useCompanyStore } from '@/stores/use-company-store'

export const ApprovalsStatsCards: React.FC = () => {
  const { activeCompany } = useCompanyStore()
  const { data: leavesStats } = useGetLeaveStats({
    companyId: activeCompany?.id ?? '',
  })

  const pendingCount = leavesStats?.pending ?? 0
  const approvedCount = leavesStats?.approved ?? 0
  const rejectedCount = leavesStats?.rejected ?? 0

  const stats = [
    {
      title: 'En attente',
      value: pendingCount,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Approuvées',
      value: approvedCount,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rejetées',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className='shadow-sm transition-shadow hover:shadow-md'
          >
            <CardContent>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
