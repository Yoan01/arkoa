'use client'

import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { appSidebarNav } from '@/lib/constants'
import { UserCompanyRoleInput } from '@/schemas/queries/company-role-schema'
import { IActiveCompany } from '@/stores/slices/active-company-slice'

import { InviteUserDialog } from '../company/invite-user-dialog'
import { AddLeaveDialog } from '../leaves/add-leave-dialog'

export function NavMain({
  roleInfo,
  activeCompany,
}: {
  roleInfo: UserCompanyRoleInput
  activeCompany: IActiveCompany
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            {roleInfo?.isManager ? (
              <InviteUserDialog companyId={activeCompany?.id ?? ''} />
            ) : (
              <AddLeaveDialog
                trigger={
                  <SidebarMenuButton
                    tooltip='Quick Create'
                    className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
                  >
                    <PlusCircleIcon />
                    <span>Quick Create</span>
                  </SidebarMenuButton>
                }
              />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {appSidebarNav.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
