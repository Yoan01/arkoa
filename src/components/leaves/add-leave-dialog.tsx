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
import { Leave, LeaveType } from '@/generated/prisma'
import { useCreateLeave } from '@/hooks/api/leaves/create-leave'
import { useUpdateLeave } from '@/hooks/api/leaves/update-leave'
import { leaveTypeLabels } from '@/lib/constants'
import {
  CreateLeaveInput,
  CreateLeaveSchema,
} from '@/schemas/create-leave-schema'
import {
  UpdateLeaveInput,
  UpdateLeaveSchema,
} from '@/schemas/update-leave-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { DateTimePicker } from '../ui/date-time-picker'
import { Textarea } from '../ui/textarea'

interface Props {
  trigger?: React.ReactNode
  leave?: Leave
}

export function AddLeaveDialog({ trigger, leave }: Props) {
  const [open, setOpen] = useState(false)
  const createLeave = useCreateLeave()
  const updateLeave = useUpdateLeave()
  const { activeCompany } = useCompanyStore()
  const companyId = activeCompany?.id ?? ''
  const membershipId = activeCompany?.userMembershipId ?? ''

  const isEditing = !!leave

  const form = useForm<CreateLeaveInput | UpdateLeaveInput>({
    resolver: zodResolver(isEditing ? UpdateLeaveSchema : CreateLeaveSchema),
    defaultValues: isEditing
      ? {
          type: leave.type,
          startDate: new Date(leave.startDate),
          endDate: new Date(leave.endDate),
          reason: leave.reason ?? '',
        }
      : {
          type: LeaveType.PAID,
          startDate: new Date(),
          endDate: new Date(),
          reason: '',
        },
  })

  const onSubmit = async (values: CreateLeaveInput | UpdateLeaveInput) => {
    if (isEditing && leave) {
      await updateLeave.mutateAsync(
        {
          companyId,
          membershipId,
          leaveId: leave.id,
          data: values,
        },
        {
          onSuccess() {
            form.reset()
            toast.success('Demande de congé modifiée avec succès')
            setOpen(false)
          },
          onError(error) {
            toast.error('Erreur lors de la modification du congé', {
              description: error.message,
            })
          },
        }
      )
    } else {
      await createLeave.mutateAsync(
        {
          companyId,
          membershipId,
          data: values as CreateLeaveInput,
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
            {isEditing ? 'Modifier la demande' : 'Nouvelle demande'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Modifier la demande de congé'
              : 'Nouvelle demande de congé'}
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations nécessaires pour{' '}
            {isEditing ? 'modifier' : 'créer'} une demande de congé.
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
                        value={
                          field.value instanceof Date
                            ? field.value
                            : new Date(field.value)
                        }
                        onChange={date => field.onChange(date)}
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
                        value={
                          field.value instanceof Date
                            ? field.value
                            : new Date(field.value)
                        }
                        onChange={date => field.onChange(date)}
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
                      {Object.entries(leaveTypeLabels).map(([value, label]) => (
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
              <Button
                type='submit'
                disabled={createLeave.isPending || updateLeave.isPending}
              >
                {createLeave.isPending || updateLeave.isPending
                  ? 'En cours...'
                  : isEditing
                    ? 'Modifier'
                    : 'Envoyer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
