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
import { useCreateCompany } from '@/hooks/api/companies/create-company'
import { useGetCompany } from '@/hooks/api/companies/get-company'
import { useUpdateCompany } from '@/hooks/api/companies/update-company'
import { cn } from '@/lib/utils'
import {
  CreateCompanyInput,
  CreateCompanySchema,
} from '@/schemas/create-company-schema'

import { sidebarMenuButtonVariants } from '../ui/sidebar'

interface Props {
  companyId?: string
  children?: React.ReactNode
}

export function AddCompanyDialog({ companyId }: Props) {
  const [open, setOpen] = useState(false)
  const { data: company } = useGetCompany(companyId ?? '')
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()

  const form = useForm<CreateCompanyInput>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: {
      name: '',
      logoUrl: '',
    },
  })

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        logoUrl: company.logoUrl || '',
      })
    }
  }, [company, form])

  const onSubmit = async (values: CreateCompanyInput) => {
    if (companyId) {
      await updateCompany.mutateAsync(
        {
          id: companyId,
          name: values.name,
          logoUrl: values.logoUrl || '',
        },
        {
          onSuccess() {
            form.reset()
            toast.success(`Votre entreprise a bien été modifié`)
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
        },
        {
          onSuccess() {
            form.reset()
            toast.success(`Votre entreprise a bien été créé`)
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
        {companyId ? (
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
            {companyId ? "Modifier l'entreprise" : 'Ajouter une entreprise'}
          </DialogTitle>
          <DialogDescription>
            {companyId
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
                <FormItem className='tems-center gap-4'>
                  <FormLabel className='text-right'>Nom</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom de l'entreprise"
                      {...field}
                      className='col-span-3'
                    />
                  </FormControl>
                  <FormMessage className='' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='logoUrl'
              render={({ field }) => (
                <FormItem className='gap-4'>
                  <FormLabel className='text-right'>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com/logo.png'
                      {...field}
                      value={field.value || ''}
                      className='col-span-3'
                    />
                  </FormControl>
                  <FormMessage className='col-span-3 col-start-2' />
                </FormItem>
              )}
            />
            <DialogFooter className='mt-4'>
              <Button type='submit'>{companyId ? 'Modifier' : 'Créer'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
