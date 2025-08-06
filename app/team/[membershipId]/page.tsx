'use client'

import { useEffect, useState } from 'react'

import { MemberDetailsCard } from '@/components/team/member-details-card'
import { MemberLeavesTabs } from '@/components/team/member-leaves-tabs'

interface MemberDetailsPageProps {
  params: Promise<{
    membershipId: string
  }>
}

export default function MemberDetailsPage({ params }: MemberDetailsPageProps) {
  const [membershipId, setMembershipId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ membershipId }) => setMembershipId(membershipId))
  }, [params])

  if (!membershipId) return null

  return (
    <div className='flex flex-col gap-6 px-4 py-4'>
      <MemberDetailsCard membershipId={membershipId} />
      <MemberLeavesTabs membershipId={membershipId} />
    </div>
  )
}
