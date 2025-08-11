import Brand from '@/components/ui/brand'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex min-h-screen'>
      <div className='bg-muted hidden flex-col justify-between p-8 lg:flex lg:w-1/2'>
        <div className='flex items-center space-x-2'>
          <div className='flex items-center justify-center'>
            <Brand width={20} height={20} />
          </div>
          <span className='text-secondary text-xl font-semibold'>Arkoa</span>
        </div>

        <div className='text-muted-foreground text-lg'>
          "Simplifiez la gestion des congés de votre entreprise."
        </div>
      </div>

      <div className='flex w-full items-center justify-center p-8 lg:w-1/2'>
        {children}
      </div>
    </div>
  )
}
