import { MemberDetailsCard } from '@/components/team/member-details-card'
import { MemberLeaveHistoryCard } from '@/components/team/member-leave-history-card'
import { MemberLeavesCard } from '@/components/team/member-leaves-card'

interface MemberDetailsPageProps {
  params: Promise<{
    membershipId: string
  }>
}

export default async function MemberDetailsPage({
  params,
}: MemberDetailsPageProps) {
  const { membershipId } = await params

  return (
    <div className='flex flex-col gap-6 px-4 py-4'>
      <MemberDetailsCard membershipId={membershipId} />
      <MemberLeavesCard membershipId={membershipId} />
      <MemberLeaveHistoryCard membershipId={membershipId} />
    </div>
  )
}
