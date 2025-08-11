'use client'

import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FeatureComingSoonDialog } from '@/components/ui/feature-coming-soon-dialog'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { signOut, useSession } from '@/lib/auth-client'

export function NavUser({}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data } = useSession()
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState('')

  const handleFeatureClick = (featureName: string) => {
    setSelectedFeature(featureName)
    setIsFeatureDialogOpen(true)
  }

  if (!data) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='group/avatar'>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg group-hover/avatar:grayscale'>
                <AvatarImage src={data.user.image ?? ''} alt={data.user.name} />
                <AvatarFallback className='rounded-lg'>
                  {data.user.name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{data.user.name}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {data.user.email}
                </span>
              </div>
              <MoreVerticalIcon className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={data.user.image ?? ''}
                    alt={data.user.name}
                  />
                  <AvatarFallback className='rounded-lg'>
                    {data.user.name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{data.user.name}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {data.user.email}
                  </span>
                </div>
                {/* <ModeToggle /> */}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleFeatureClick('Comtpe')}>
                <UserCircleIcon />
                Comtpe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFeatureClick('Factures')}>
                <CreditCardIcon />
                Factures
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFeatureClick('Notifications')}
              >
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/auth/signin')
                    },
                  },
                })
              }}
            >
              <LogOutIcon />
              Se deconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <FeatureComingSoonDialog
          open={isFeatureDialogOpen}
          onOpenChange={setIsFeatureDialogOpen}
          featureName={selectedFeature}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
