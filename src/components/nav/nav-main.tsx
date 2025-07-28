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

import { InviteUserDialog } from '../company/invite-user-dialog'
import { AddLeaveDialog } from '../leaves/add-leave-dialog'

export function NavMain({ isManager }: { isManager: boolean }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            {isManager ? (
              <InviteUserDialog
                trigger={
                  <SidebarMenuButton
                    tooltip='Inviter un membre'
                    className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
                  >
                    <PlusCircleIcon />
                    <span>Inviter un membre</span>
                  </SidebarMenuButton>
                }
              />
            ) : (
              <AddLeaveDialog
                trigger={
                  <SidebarMenuButton
                    tooltip='Nouvelle demande'
                    className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
                  >
                    <PlusCircleIcon />
                    <span>Nouvelle demande</span>
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
