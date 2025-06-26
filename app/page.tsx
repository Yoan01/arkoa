import { AppSidebar } from '@/components/nav/app-sidebar'
import { SiteHeader } from '@/components/nav/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>yo</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
