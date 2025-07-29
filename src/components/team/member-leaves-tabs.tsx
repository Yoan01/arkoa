'use client'

import { CalendarIcon, HistoryIcon } from 'lucide-react'
import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MemberLeaveHistoryCard } from './member-leave-history-card'
import { MemberLeavesCard } from './member-leaves-card'

interface MemberLeavesTabsProps {
  membershipId: string
}

export const MemberLeavesTabs: React.FC<MemberLeavesTabsProps> = ({
  membershipId,
}) => {
  return (
    <Tabs defaultValue='leaves' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='leaves' className='flex items-center gap-2'>
          <CalendarIcon className='h-4 w-4' />
          Congés Récents
        </TabsTrigger>
        <TabsTrigger value='history' className='flex items-center gap-2'>
          <HistoryIcon className='h-4 w-4' />
          Historique
        </TabsTrigger>
      </TabsList>

      <TabsContent value='leaves' className='mt-6'>
        <MemberLeavesCard membershipId={membershipId} />
      </TabsContent>

      <TabsContent value='history' className='mt-6'>
        <MemberLeaveHistoryCard membershipId={membershipId} />
      </TabsContent>
    </Tabs>
  )
}
