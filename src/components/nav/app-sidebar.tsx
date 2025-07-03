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
import { useGetCompanyRole } from '@/hooks/api/users/get-company-role'
import { UserCompanyRoleInput } from '@/schemas/queries/company-role-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { NavCompany } from './nav-company'
import { NavMain } from './nav-main'
import { NavManagers } from './nav-managers'
import { NavUser } from './nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeCompany } = useCompanyStore()
  const { data: roleInfo, isFetching: isFetchingRole } = useGetCompanyRole(
    activeCompany?.id
  )

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
        {!isFetchingRole && activeCompany && (
          <>
            <NavMain
              roleInfo={roleInfo as UserCompanyRoleInput}
              activeCompany={activeCompany}
            />
            {roleInfo?.isManager && <NavManagers />}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
