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
import { useCompanies } from '@/hooks/api/companies'
import { appSidebarDocs, appSidebarNav } from '@/lib/constants'

import { NavCompany } from './nav-company'
import { NavDocuments } from './nav-documennts'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useCompanies()

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavCompany />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data && data.length > 0 && (
          <>
            <NavMain items={appSidebarNav} />
            <NavDocuments items={appSidebarDocs} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
