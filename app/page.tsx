import { CalendarView } from '@/components/dashboard/calendar-view'

export default function Dashboard() {
  return (
    <div className='flex h-full flex-col gap-6 px-4 py-6 md:px-6'>
      {/* Vue calendrier des congés */}
      <section className='h-full space-y-4'>
        <CalendarView />
      </section>
    </div>
  )
}
