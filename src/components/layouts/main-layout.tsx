'use client'

import { LoaderCircleIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

import { useSession } from '@/lib/auth-client'
import { useCompanyStore } from '@/stores/use-company-store'

import { AppSidebar } from '../nav/app-sidebar'
import { SiteHeader } from '../nav/site-header'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'

interface AuthLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: AuthLayoutProps) {
  const { data, isPending } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { activeCompany } = useCompanyStore()

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
        {<SiteHeader />}
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            {!activeCompany ? (
              <div className='flex h-full flex-col items-center justify-center text-center'>
                <p>
                  Vous n'avez encore aucune entreprise. <br />
                  Ajoutez-en une maintenant pour profiter de l'application !
                </p>
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
