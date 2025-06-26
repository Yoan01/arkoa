'use client'

import Link from 'next/link'
import { useState } from 'react'

import SignupForm from '@/components/auth/signup-form'
import Brand from '@/components/ui/brand'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function SignInPage() {
  const [email, setEmail] = useState('yoan.ranchon@gmail.com')
  const [password, setPassword] = useState('••••••••••••••••••••')

  return (
    <div className='w-full max-w-md space-y-8'>
      <div className='space-y-4 text-center'>
        <div className='mb-8 flex items-center justify-center space-x-2'>
          <div className='flex items-center justify-center'>
            <Brand width={20} height={20} />
          </div>
          <h1 className='text-secondary text-2xl font-semibold'>Sign up</h1>
        </div>
        <p className='text-sm'>Enter your informations or use google.</p>
      </div>

      <SignupForm />

      {/* Footer */}
      <div className='flex flex-col items-center space-y-6'>
        <Link
          href='/forgot-password'
          className={cn(buttonVariants({ variant: 'link' }))}
        >
          Lost your password?
        </Link>
      </div>
    </div>
  )
}
