'use client'

import { usePathname } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { routeTitles } from '@/lib/constants'

import { InviteUserDialog } from '../company/invite-user-dialog'
import { AddLeaveDialog } from '../leaves/add-leave-dialog'

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = routeTitles[pathname] || 'Tableau de bord'
  return (
    <header className='flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex w-full items-center justify-between px-2 sm:px-4 lg:px-6'>
        <div className='flex w-full items-center gap-1 lg:gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mx-1 data-[orientation=vertical]:h-4 sm:mx-2'
          />
          <h1 className='truncate text-sm font-medium sm:text-base'>
            {pageTitle}
          </h1>
        </div>
        {pathname === '/leaves' && <AddLeaveDialog />}
        {pathname === '/team' && <InviteUserDialog />}
      </div>
    </header>
  )
}
