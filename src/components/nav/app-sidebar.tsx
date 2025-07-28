'use client'
import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserRole } from '@/generated/prisma'
import { useCompanyStore } from '@/stores/use-company-store'

import { NavCompany } from './nav-company'
import { NavMain } from './nav-main'
import { NavManagers } from './nav-managers'
import { NavUser } from './nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeCompany } = useCompanyStore()

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavCompany />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {activeCompany && (
          <>
            <NavMain isManager={activeCompany?.userRole === UserRole.MANAGER} />
            {activeCompany?.userRole === UserRole.MANAGER && <NavManagers />}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
