import { LeaveBalanceCard } from '@/components/leaves-balances/leaves-balance-card'

export default function Leaves() {
  return (
    <div className='flex flex-col gap-4 px-4 py-4 md:gap-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <LeaveBalanceCard />
        <div></div>
        {/* 
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Demandes en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1</div>
            <p className='text-xs'>en cours de validation</p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
