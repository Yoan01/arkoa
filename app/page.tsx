import { CalendarView } from '@/components/dashboard/calendar-view'

export default function Dashboard() {
  return (
    <div className='flex h-full flex-col gap-4 px-2 py-2 sm:px-4 sm:py-4 md:gap-6 md:px-6 md:py-6'>
      {/* Vue calendrier des congés */}
      <section className='h-full space-y-4'>
        <CalendarView />
      </section>
    </div>
  )
}
