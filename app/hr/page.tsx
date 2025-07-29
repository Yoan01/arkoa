import { HrDataTable } from '@/components/hr/hr-data-table'
import { HrStatsCards } from '@/components/hr/hr-stats-cards'

export default async function HrPage() {
  return (
    <div className='flex flex-col gap-4 px-4 py-4 md:gap-6'>
      <HrStatsCards />
      <HrDataTable />
    </div>
  )
}
