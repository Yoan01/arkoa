'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
import { useGetCompanies } from '@/hooks/api/companies/get-companies'
import { signIn } from '@/lib/auth-client'
import { passwordConstraint } from '@/lib/validator'
import { UserCompanyInput } from '@/schemas/queries/user-company-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { GoogleComingSoonDialog } from '../ui/google-coming-soon-dialog'
import { Icons } from '../ui/icons'
import { OrSeparator } from '../ui/or-separator'

const formSchema = z.object({
  email: z.string().min(1),
  password: passwordConstraint,
})

export default function SigninForm() {
  const [isloading, setIsloading] = useState(false)
  const [isGoogleDialogOpen, setIsGoogleDialogOpen] = useState(false)
  const router = useRouter()
  const { activeCompany, setActiveCompany } = useCompanyStore()
  const { refetch: refetchCompanies } = useGetCompanies({ enabled: false })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsloading(true)
      const result = await signIn.email({
        email: values.email,
        password: values.password,
      })

      if (result.error) {
        toast.error(
          result.error.message ||
            'Erreur lors de la connexion. Veuillez vérifier vos identifiants.'
        )
      } else {
        toast.success('Connexion réussie !')

        // Vérifier si l'utilisateur appartient à l'entreprise stockée
        if (activeCompany) {
          try {
            const companiesResult = await refetchCompanies()
            if (companiesResult.data) {
              const belongsToStoredCompany = companiesResult.data.some(
                (company: UserCompanyInput) => company.id === activeCompany.id
              )

              if (!belongsToStoredCompany) {
                // L'utilisateur n'appartient pas à l'entreprise stockée
                setActiveCompany(null)
                toast.warning(
                  "Vous n'appartenez plus à l'entreprise précédemment sélectionnée. Veuillez en choisir une nouvelle."
                )
              }
            }
          } catch (error) {
            console.error(
              "Erreur lors de la vérification de l'entreprise:",
              error
            )
            // En cas d'erreur, on continue sans bloquer la connexion
          }
        }

        router.push('/')
      }
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Erreur lors de la connexion. Veuillez réessayer.')
    } finally {
      setIsloading(false)
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

        <Button type='submit' className={'w-full'} disabled={isloading}>
          {isloading ? (
            <LoaderCircleIcon className='animate-spin' />
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      <OrSeparator />

      <div className='flex flex-col items-center justify-between gap-4'>
        <Button
          variant='outline'
          className='w-full'
          onClick={() => setIsGoogleDialogOpen(true)}
        >
          <Icons.google className='mr-2 size-5' />
          Se connecter avec Google
        </Button>

        <GoogleComingSoonDialog
          open={isGoogleDialogOpen}
          onOpenChange={setIsGoogleDialogOpen}
        />

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
