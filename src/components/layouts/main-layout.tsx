'use client'

import { LoaderCircleIcon, PlusCircleIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

import { useCompanies } from '@/hooks/api/companies'
import { useSession } from '@/lib/auth-client'

import { AppSidebar } from '../nav/app-sidebar'
import { SiteHeader } from '../nav/site-header'
import { Button } from '../ui/button'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'

interface AuthLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: AuthLayoutProps) {
  const { data, isPending } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { data: companies } = useCompanies()

  useEffect(() => {
    if (!isPending && !data?.user && !pathname.startsWith('/auth')) {
      router.push('/auth/signin')
    }
  }, [isPending, data, pathname, router])

  if (pathname.startsWith('/auth')) {
    return children
  }

  if (isPending) {
    return (
      <div className='fixed inset-0 flex items-center justify-center'>
        <LoaderCircleIcon className='text-primary animate-spin' />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>
        {companies && companies.length > 0 && <SiteHeader />}
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            {!companies?.length ? (
              <div className='flex h-full items-center justify-center'>
                <Button
                  variant={'outline'}
                  className='flex items-center justify-center'
                >
                  <PlusCircleIcon />
                  <span>Ajouter une entreprise</span>
                </Button>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
