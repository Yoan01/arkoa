import { CalendarView } from '@/components/dashboard/calendar-view'

export default function Dashboard() {
  return (
    <div className='flex h-full flex-col gap-6 px-4 py-6 md:px-6'>
      {/* Vue calendrier des congés */}
      <section className='h-full space-y-4'>
        <CalendarView />
      </section>

      {/* Statistiques principales */}
      {/* <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Statistiques générales</h2>
        <HrStatsCards />
      </section> */}

      {/* Présence de l'équipe */}
      {/* <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Présence de l'équipe</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <ActifMembershipCard />

          <Card className='justify-between shadow-sm transition-shadow hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Congés à venir
              </CardTitle>
              <CalendarIcon className='h-5 w-5 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-blue-600'>3</div>
              <p className='text-muted-foreground text-xs'>
                Dans les 7 prochains jours
              </p>
            </CardContent>
          </Card>

          <Card className='justify-between shadow-sm transition-shadow hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Temps de réponse
              </CardTitle>
              <ClockIcon className='h-5 w-5 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-green-600'>2.1</div>
              <p className='text-muted-foreground text-xs'>Jours en moyenne</p>
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* Informations de l'entreprise */}
      {/* <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Informations générales</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUpIcon className='h-5 w-5 text-purple-500' />
                Politique de congés
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground text-sm'>
                  Congés payés annuels
                </span>
                <span className='font-medium'>25 jours</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground text-sm'>
                  Congés maladie
                </span>
                <span className='font-medium'>Selon convention</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground text-sm'>
                  Délai de demande
                </span>
                <span className='font-medium'>2 semaines</span>
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle>Contacts utiles</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Ressources Humaines</p>
                <p className='text-muted-foreground text-sm'>
                  rh@entreprise.com
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Support IT</p>
                <p className='text-muted-foreground text-sm'>
                  support@entreprise.com
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Direction</p>
                <p className='text-muted-foreground text-sm'>
                  direction@entreprise.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}
    </div>
  )
}
