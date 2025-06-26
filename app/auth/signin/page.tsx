'use client'

import Link from 'next/link'
import { useState } from 'react'

import Brand from '@/components/ui/brand'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrSeparator } from '@/components/ui/or-separator'
import { cn } from '@/lib/utils'

export default function SignInPage() {
  const [email, setEmail] = useState('yoan.ranchon@gmail.com')
  const [password, setPassword] = useState('••••••••••••••••••••')

  return (
    <div className='w-full max-w-md space-y-8'>
      <div className='space-y-4 text-center'>
        <div className='flex items-center justify-center space-x-2'>
          <div className='flex items-center justify-center'>
            <Brand width={20} height={20} />
          </div>
          <h1 className='text-secondary text-2xl font-semibold'>Connexion</h1>
        </div>
        <p className='text-sm'>
          Entrer votre email et mot de passe pour vos connecter
        </p>
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

        <div>
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
          <Link
            href='/forgot-password'
            className={cn(
              buttonVariants({ variant: 'link' }),
              'flex justify-end p-0 text-xs'
            )}
          >
            Lost your password?
          </Link>
        </div>

        <Button type='submit' className='w-full'>
          Se connecter
        </Button>
      </form>

      <OrSeparator />

      <div className='flex flex-col items-center justify-between gap-4'>
        <Button variant='outline' className='w-full'>
          <Icons.google className='mr-2 size-5' />
          Se connecter avec Google
        </Button>

        <span className='flex items-end gap-1 text-xs'>
          Vous n'avez pas de compte?
          <Link href='/auth/signup' className='text-primary hover:underline'>
            Créer un compte
          </Link>
        </span>
      </div>
    </div>
  )
}
