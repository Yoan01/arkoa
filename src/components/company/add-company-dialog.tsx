import { zodResolver } from '@hookform/resolvers/zod'
import { PenBoxIcon, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Company } from '@/generated/prisma'
import { useCreateCompany } from '@/hooks/api/companies/create-company'
import { useUpdateCompany } from '@/hooks/api/companies/update-company'
import { cn } from '@/lib/utils'
import {
  CreateCompanyInput,
  CreateCompanySchema,
} from '@/schemas/create-company-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { sidebarMenuButtonVariants } from '../ui/sidebar'

interface Props {
  company?: Company
}

export function AddCompanyDialog({ company }: Props) {
  const [open, setOpen] = useState(false)
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const { activeCompany, setActiveCompany } = useCompanyStore()

  const form = useForm<CreateCompanyInput>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      annualLeaveDays: 25,
    },
  })

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        logoUrl: company.logoUrl || '',
        annualLeaveDays: company.annualLeaveDays ?? 25,
      })
    }
  }, [company, form])

  const onSubmit = async (values: CreateCompanyInput) => {
    if (company) {
      await updateCompany.mutateAsync(
        {
          id: company.id,
          name: values.name,
          logoUrl: values.logoUrl || '',
          annualLeaveDays: values.annualLeaveDays,
        },
        {
          onSuccess(data) {
            form.reset()
            toast.success(`Votre entreprise a bien été modifiée`)
            if (activeCompany?.id === company.id) {
              setActiveCompany(data)
            }
            setOpen(false)
          },
          onError(error) {
            toast.error("Erreur lors de la modification de l'entreprise", {
              description: error.message,
            })
          },
        }
      )
    } else {
      await createCompany.mutateAsync(
        {
          name: values.name,
          logoUrl: values.logoUrl || '',
          annualLeaveDays: values.annualLeaveDays,
        },
        {
          onSuccess() {
            form.reset()
            toast.success(`Votre entreprise a bien été créée`)
            setOpen(false)
          },
          onError(error) {
            toast.error("Erreur lors de la création de l'entreprise", {
              description: error.message,
            })
          },
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {company ? (
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              sidebarMenuButtonVariants({ variant: 'default' }),
              'size-10'
            )}
          >
            <PenBoxIcon className='text-primary' />
          </Button>
        ) : (
          <DropdownMenuItem
            className='gap-2 p-2'
            onSelect={e => e.preventDefault()}
          >
            <Plus className='size-4' />
            Ajouter entreprise
          </DropdownMenuItem>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {company ? "Modifier l'entreprise" : 'Ajouter une entreprise'}
          </DialogTitle>
          <DialogDescription>
            {company
              ? "Modifier le nom et le logo de l'entreprise"
              : 'Créer une nouvelle entreprise pour gérer vos projets.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 py-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='logoUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/logo.png'
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='annualLeaveDays'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jours de congés annuels</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Entrer un nombre...'
                      {...field}
                      value={field.value}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                      min={25}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='mt-4'>
              <Button type='submit'>{company ? 'Modifier' : 'Créer'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
