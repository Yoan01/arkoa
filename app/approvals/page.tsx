import { ApprovalsDataTable } from '@/components/approvals/approvals-data-table'
import { ApprovalsStatsCards } from '@/components/approvals/approvals-stats-cards'

export default async function ApprovalsPage() {
  return (
    <div className='flex flex-col gap-4 px-4 py-4 md:gap-6'>
      <ApprovalsStatsCards />
      <ApprovalsDataTable />
    </div>
  )
}
