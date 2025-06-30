import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
import { useCompany } from '@/hooks/api/companies'
import {
  CreateCompanyInput,
  CreateCompanySchema,
} from '@/schemas/create-company-schema'

interface Props {
  companyId?: string
  children?: React.ReactNode
}

export function AddCompanyDialog({ companyId }: Props) {
  const [open, setOpen] = useState(false)
  const { data: company } = useCompany(companyId ?? '')
  const createCompany = useMutation({
    mutationFn: async (data: CreateCompanyInput) => {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }

      return res.json()
    },
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
  })

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
    await createCompany.mutateAsync({
      name: values.name,
      logoUrl: values.logoUrl || '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {companyId ? (
          <DropdownMenuItem
            className='group cursor-pointer hover:bg-blue-500/10'
            onSelect={e => e.preventDefault()}
          >
            <PenBoxIcon className='text-primary size-3.5 group-hover:text-blue-500' />
          </DropdownMenuItem>
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
