'use client'

import { type LucideIcon, PlusCircleIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useGetActiveCompany } from '@/hooks/api/users/get-active-company'
import { useGetCompanyRole } from '@/hooks/api/users/get-company-role'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const { data: activeCompany } = useGetActiveCompany()
  const { data: roleInfo } = useGetCompanyRole(activeCompany?.id)
  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            {roleInfo?.isManager ? (
              <SidebarMenuButton
                tooltip='Quick Create'
                className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
              >
                <PlusCircleIcon />
                <span>Inviter un membre</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                tooltip='Quick Create'
                className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
              >
                <PlusCircleIcon />
                <span>Quick Create</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
