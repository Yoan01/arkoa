'use client'

import { ChevronsUpDownIcon, Trash2Icon } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

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
import { UserRole } from '@/generated/prisma'
import { useDeleteCompany } from '@/hooks/api/companies/delete-company'
import { useGetCompanies } from '@/hooks/api/companies/get-companies'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/use-company-store'

import { AddCompanyDialog } from '../company/add-company-dialog'
import { DialogAction } from '../ui/dialog-action'
import { Logo } from '../ui/logo'

export function NavCompany() {
  const { state, isMobile } = useSidebar()
  const { data } = useSession()

  const { data: companies, isFetching } = useGetCompanies()

  const { activeCompany, setActiveCompany } = useCompanyStore()
  const deleteCompany = useDeleteCompany()

  useEffect(() => {
    if (!isFetching && (!companies || (companies && companies?.length === 0))) {
      setActiveCompany(null)
    }
  }, [companies, setActiveCompany, isFetching])

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
                logoUrl={activeCompany?.logoUrl || undefined}
              />
            </div>
            <div
              className={cn(
                'flex flex-col items-start',
                state === 'collapsed' && 'hidden'
              )}
            >
              <p className='text-sm leading-none font-medium'>
                {activeCompany?.name ?? 'Ajouter entreprise'}
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
          <div className='flex flex-row justify-between' key={company.id}>
            <DropdownMenuItem
              onClick={async () => {
                if (activeCompany?.id === company.id) return
                setActiveCompany(company)
              }}
              className='w-full gap-2 p-2'
            >
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Logo
                  className={cn(
                    'transition-all',
                    state === 'collapsed' ? 'size-6' : 'size-10'
                  )}
                  logoUrl={company.logoUrl ?? undefined}
                />
              </div>
              <div className='flex flex-col gap-4'>{company.name}</div>
            </DropdownMenuItem>
            {company.userRole === UserRole.MANAGER && (
              <div className='flex items-center gap-2'>
                <AddCompanyDialog company={company} />
                <DialogAction
                  title="Suppression de l'entreprise"
                  description='Êtes-vous sûr de vouloir supprimer cette entreprise ?'
                  onClick={async () => {
                    await deleteCompany.mutateAsync(
                      { companyId: company.id },
                      {
                        onSuccess: () => {
                          toast.success('Entreprise supprimée')
                          if (activeCompany?.id === company.id) {
                            setActiveCompany(null)
                          }
                        },
                        onError: error => {
                          toast.error(error.message)
                        },
                      }
                    )
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
