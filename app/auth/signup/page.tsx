import SignupForm from '@/components/auth/signup-form'
import Brand from '@/components/ui/brand'

export default function SignInPage() {
  return (
    <div className='w-full max-w-md space-y-8'>
      <div className='space-y-4 text-center'>
        <div className='flex items-center justify-center space-x-2'>
          <div className='flex items-center justify-center'>
            <Brand width={20} height={20} />
          </div>
          <h1 className='text-secondary text-2xl font-semibold'>Inscription</h1>
        </div>
        <p className='text-sm'>
          Entrer les informations demandées ou utiliser google pour créer un
          compte.
        </p>
      </div>

      <SignupForm />
    </div>
  )
}
