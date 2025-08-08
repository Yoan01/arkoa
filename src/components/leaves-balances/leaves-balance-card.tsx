'use client'

import { Calendar, Clock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGetLeaveBalanceHistory } from '@/hooks/api/leave-balances/get-leave-balance-history'
import { useGetLeaveBalances } from '@/hooks/api/leave-balances/get-leave-balances'
import { useGetMembershipLeaves } from '@/hooks/api/leaves/get-membership-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

export const LeavesBalanceCard: React.FC = ({}) => {
  const activeCompany = useCompanyStore(state => state.activeCompany)

  const {
    data: leaveBalances,
    isLoading: isLoadingBalances,
    error: errorBalances,
  } = useGetLeaveBalances(
    activeCompany?.id || '',
    activeCompany?.userMembershipId || ''
  )

  const { data: leaveHistory, isLoading: isLoadingHistory } =
    useGetLeaveBalanceHistory(activeCompany?.userMembershipId || '')

  const { data: approvedLeaves, isLoading: isLoadingLeaves } =
    useGetMembershipLeaves(
      activeCompany?.id || '',
      activeCompany?.userMembershipId || ''
    )

  // Récupérer le solde de congés payés
  const paidLeaveBalance = leaveBalances?.find(
    balance => balance.type === 'PAID'
  )
  const remainingDays = paidLeaveBalance?.remainingDays || 0
  const totalDays = activeCompany?.annualLeaveDays || 25

  // Calculer les jours utilisés basés sur les congés approuvés
  const approvedPaidLeaves =
    approvedLeaves?.filter(
      leave => leave.type === 'PAID' && leave.status === 'APPROVED'
    ) || []

  // Calculer le total des jours de congés approuvés
  const usedDays = approvedPaidLeaves.reduce((total, leave) => {
    const startDate = new Date(leave.startDate)
    const endDate = new Date(leave.endDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return total + (leave.halfDayPeriod ? 0.5 : diffDays)
  }, 0)

  // Calculer les crédits à venir (MANUAL_CREDIT + AUTO_CREDIT)
  const paidLeaveHistory =
    leaveHistory?.filter(
      history =>
        history.leaveBalance.type === 'PAID' &&
        (history.type === 'MANUEL_CREDIT' || history.type === 'AUTO_CREDIT')
    ) || []

  const totalCreditsReceived = paidLeaveHistory.reduce((total, history) => {
    return total + history.change
  }, 0)

  // Les crédits à venir = crédits déjà reçus qui n'ont pas encore été utilisés
  const upcomingCredits = Math.max(0, totalDays - totalCreditsReceived)

  const progressPercentage = totalDays > 0 ? (usedDays / totalDays) * 100 : 0

  const isLoading = isLoadingBalances || isLoadingHistory || isLoadingLeaves
  const error = errorBalances

  if (isLoading) {
    return (
      <Card className='shadow-sm transition-shadow hover:shadow-md'>
        <CardContent className='px-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              <h3 className='font-medium'>Congés payés restants</h3>
            </div>
            <Clock className='h-4 w-4 text-gray-400' />
          </div>
          <div className='space-y-3'>
            <div className='text-primary text-3xl font-bold'>Chargement...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='shadow-sm transition-shadow hover:shadow-md'>
        <CardContent className='px-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              <h3 className='font-medium'>Congés payés restants</h3>
            </div>
            <Clock className='h-4 w-4 text-gray-400' />
          </div>
          <div className='space-y-3'>
            <div className='text-destructive text-sm'>
              Erreur lors du chargement
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardContent className='px-4 sm:px-6'>
        <div className='mb-3 flex items-center justify-between sm:mb-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 sm:h-5 sm:w-5' />
            <h3 className='text-sm font-medium sm:text-base'>
              Congés payés restants
            </h3>
          </div>
          <Clock className='h-3 w-3 text-gray-400 sm:h-4 sm:w-4' />
        </div>

        <div className='space-y-3 sm:space-y-4'>
          <div className='text-primary text-2xl font-bold sm:text-3xl'>
            {remainingDays} jours
          </div>

          {/* Statistiques détaillées */}

          {/* Barre de progression */}
          <div className='space-y-2'>
            <div className='flex justify-between text-xs sm:text-sm'>
              <div className='grid grid-cols-2 gap-2 text-xs sm:gap-4 sm:text-sm'>
                <div className='flex gap-1 text-center sm:text-left'>
                  <span className='text-muted-foreground'>Utilisés:</span>
                  <div className='font-medium'>{usedDays} jours</div>
                </div>
                <div className='flex gap-1 text-center sm:text-left'>
                  <span className='text-muted-foreground'>À venir:</span>
                  <div className='font-medium text-green-600'>
                    {upcomingCredits} jours
                  </div>
                </div>
              </div>
              <span>{totalDays} jours total</span>
            </div>
            <Progress
              value={Math.max(0, 100 - progressPercentage)}
              className='h-2'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
