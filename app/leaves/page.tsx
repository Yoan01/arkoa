import { LeaveDataTable } from '@/components/leaves/leave-data-table'
import { LeaveRequestsCard } from '@/components/leaves/leave-requests-card'
import { LeavesBalanceCard } from '@/components/leaves-balances/leaves-balance-card'

export default async function LeavesPage() {
  return (
    <div className='flex flex-col gap-4 px-4 py-4 md:gap-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <LeavesBalanceCard />
        <LeaveRequestsCard />
      </div>
      <LeaveDataTable />
    </div>
  )
}
