'use client'

import { ChevronsUpDownIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { useCompanies } from '@/hooks/api/companies'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

import { AddCompanyDialog } from '../company/add-company-dialog'
import { DialogAction } from '../ui/dialog-action'
import { Logo } from '../ui/logo'

export function NavCompany() {
  const { data: companies } = useCompanies()
  const { state, isMobile } = useSidebar()
  const [currentCompany, setCurrentCompany] = useState(companies?.[0])
  const { data } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size={state === 'collapsed' ? 'sm' : 'lg'}
          className={cn(
            state === 'collapsed' &&
              'mx-auto flex h-10 w-10 items-center justify-center p-2'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2',
              state === 'collapsed' && 'justify-center'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-sm border',
                'size-6'
              )}
            >
              <Logo
                className={cn(
                  'transition-all',
                  state === 'collapsed' ? 'size-4' : 'size-5'
                )}
                logoUrl={currentCompany?.logoUrl || undefined}
              />
            </div>
            <div
              className={cn(
                'flex flex-col items-start',
                state === 'collapsed' && 'hidden'
              )}
            >
              <p className='text-sm leading-none font-medium'>
                {currentCompany?.name ?? 'Ajouter entreprise'}
              </p>
            </div>
          </div>
          <ChevronsUpDownIcon
            className={cn('ml-auto', state === 'collapsed' && 'hidden')}
          />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='rounded-lg'
        align='start'
        side={isMobile ? 'bottom' : 'right'}
        sideOffset={4}
      >
        <DropdownMenuLabel className='text-muted-foreground text-xs'>
          Entreprise
        </DropdownMenuLabel>
        {companies?.map(company => (
          <div className='flex flex-row justify-between' key={company.name}>
            <DropdownMenuItem
              onClick={async () => {
                setCurrentCompany(company)
              }}
              className='w-full gap-2 p-2'
            >
              <div className='flex flex-col gap-4'>{company.name}</div>
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Logo
                  className={cn(
                    'transition-all',
                    state === 'collapsed' ? 'size-6' : 'size-10'
                  )}
                  logoUrl={company.logoUrl ?? undefined}
                />
              </div>
            </DropdownMenuItem>
            {true && ( // TODO: check if is manager
              <div className='flex items-center gap-2'>
                <AddCompanyDialog companyId={company.id} />
                <DialogAction
                  title="Supprimer l'entreprise"
                  description='Êtes-vous sûr de vouloir supprimer cette entreprise ?'
                  onClick={async () => {
                    // delete company
                  }}
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    className='group hover:bg-red-500/10'
                  >
                    <Trash2Icon className='text-primary size-4 group-hover:text-red-500' />
                  </Button>
                </DialogAction>
              </div>
            )}
          </div>
        ))}
        {data?.user && (
          <>
            <DropdownMenuSeparator />
            <AddCompanyDialog />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
