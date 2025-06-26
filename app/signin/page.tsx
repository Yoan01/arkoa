'use client'

import Link from 'next/link'
import { useState } from 'react'

import Brand from '@/components/ui/brand'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function SignInPage() {
  const [email, setEmail] = useState('yoan.ranchon@gmail.com')
  const [password, setPassword] = useState('••••••••••••••••••••')

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
          "The Open Source alternative to Netlify, Vercel, Heroku."
        </div>
      </div>

      <div className='flex w-full items-center justify-center p-8 lg:w-1/2'>
        <div className='w-full max-w-md space-y-8'>
          <div className='space-y-4 text-center'>
            <div className='mb-8 flex items-center justify-center space-x-2'>
              <div className='flex items-center justify-center'>
                <Brand width={20} height={20} />
              </div>
              <h1 className='text-secondary text-2xl font-semibold'>Sign in</h1>
            </div>
            <p className='text-sm'>Enter your email and password to sign in</p>
          </div>

          {/* Form */}
          <form className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <Button type='submit'>Login</Button>
          </form>

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
      </div>
    </div>
  )
}
