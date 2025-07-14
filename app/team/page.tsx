import { ActifMembershipCard } from '@/components/team/actif-membership-card'
import { TeamDataTable } from '@/components/team/team-data-table'

export default async function Leaves() {
  return (
    <div className='flex flex-col gap-4 px-4 py-4 md:gap-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-1'>
        <ActifMembershipCard />
        {/* <ActifMembershipCard /> */}
      </div>
      <TeamDataTable />
    </div>
  )
}
