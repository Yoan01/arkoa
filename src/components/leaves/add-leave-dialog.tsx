import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeaveType } from '@/generated/prisma'
import { useCreateLeave } from '@/hooks/api/users/create-leave'
import { leaveTypesLabels } from '@/lib/constants'
import {
  CreateLeaveInput,
  CreateLeaveSchema,
} from '@/schemas/create-leave-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { DateTimePicker } from '../ui/date-time-picker'
import { Textarea } from '../ui/textarea'

interface Props {
  trigger?: React.ReactNode
}

export function AddLeaveDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false)
  const createLeave = useCreateLeave()
  const { activeCompany } = useCompanyStore()
  const companyId = activeCompany?.id ?? ''
  const membershipId = activeCompany?.userMembershipId ?? ''

  const form = useForm<CreateLeaveInput>({
    resolver: zodResolver(CreateLeaveSchema),
    defaultValues: {
      type: LeaveType.PAID,
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    },
  })

  const onSubmit = async (values: CreateLeaveInput) => {
    await createLeave.mutateAsync(
      {
        companyId,
        membershipId,
        data: values,
      },
      {
        onSuccess() {
          form.reset()
          toast.success('Demande de congé créée avec succès')
          setOpen(false)
        },
        onError(error) {
          toast.error('Erreur lors de la création du congé', {
            description: error.message,
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            className='gap-2'
            size={'sm'}
            onSelect={e => e.preventDefault()}
          >
            <Plus className='size-4' />
            Nouvelle demande
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Nouvelle demande de congé</DialogTitle>
          <DialogDescription>
            Renseignez les informations nécessaires pour créer une demande de
            congé.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 py-4'
          >
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        granularity='minute'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        granularity='minute'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de congé</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Type de congé' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypesLabels.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif</FormLabel>
                  <FormControl>
                    <Textarea placeholder='(optionnel)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='mt-4'>
              <Button type='submit'>Envoyer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
