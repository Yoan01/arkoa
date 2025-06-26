'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { signIn } from '@/lib/auth-client'
import { passwordConstraint } from '@/lib/validator'

import { Icons } from '../ui/icons'
import { OrSeparator } from '../ui/or-separator'

const formSchema = z.object({
  email: z.string().min(1),
  password: passwordConstraint,
})

export default function SigninForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: '/',
      })
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Erreur lors de la connexion. Veuillez réessayer.')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mx-auto max-w-3xl space-y-8'
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='john.doe@exemple.com'
                  type='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Entrez votre mot de passe'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className={'w-full'}>
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
            S'inscrire
          </Link>
        </span>
      </div>
    </Form>
  )
}
