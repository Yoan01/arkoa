'use client'

import { use } from 'react'

import { MemberDetailsCard } from '@/components/team/member-details-card'
import { MemberLeavesTabs } from '@/components/team/member-leaves-tabs'

interface MemberDetailsPageProps {
  params: Promise<{
    membershipId: string
  }>
}

export default function MemberDetailsPage({ params }: MemberDetailsPageProps) {
  const { membershipId } = use(params)

  return (
    <div className='flex flex-col gap-6 px-4 py-4'>
      <MemberDetailsCard membershipId={membershipId} />
      <MemberLeavesTabs membershipId={membershipId} />
    </div>
  )
}
