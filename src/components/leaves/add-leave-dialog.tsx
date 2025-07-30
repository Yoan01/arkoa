import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import dayjs from 'dayjs'
import { CalendarIcon, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { HalfDayPeriod, Leave, LeaveType } from '@/generated/prisma'
import { useCreateLeave } from '@/hooks/api/leaves/create-leave'
import { useUpdateLeave } from '@/hooks/api/leaves/update-leave'
import { halfDayPeriodLabels, leaveTypeLabels } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  CreateLeaveInput,
  CreateLeaveSchema,
} from '@/schemas/create-leave-schema'
import {
  UpdateLeaveInput,
  UpdateLeaveSchema,
} from '@/schemas/update-leave-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Textarea } from '../ui/textarea'

interface Props {
  trigger?: React.ReactNode
  leave?: Leave
}

export function AddLeaveDialog({ trigger, leave }: Props) {
  const [open, setOpen] = useState(false)
  const [isHalfDay, setIsHalfDay] = useState(!!leave?.halfDayPeriod)
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
          halfDayPeriod: leave.halfDayPeriod ?? undefined,
          reason: leave.reason ?? '',
        }
      : {
          type: LeaveType.PAID,
          startDate: new Date(),
          endDate: new Date(),
          halfDayPeriod: undefined,
          reason: '',
        },
  })

  const startDate = form.watch('startDate')

  useEffect(() => {
    if (isHalfDay && startDate) {
      form.setValue('endDate', startDate)
    }
  }, [isHalfDay, startDate, form])

  const handleHalfDayChange = (checked: boolean) => {
    setIsHalfDay(checked)
    if (!checked) {
      form.setValue('halfDayPeriod', undefined)
    } else {
      form.setValue('halfDayPeriod', HalfDayPeriod.MORNING)
    }
  }

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
                        {Object.entries(leaveTypeLabels).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-col space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='halfDay'
                    checked={isHalfDay}
                    onCheckedChange={handleHalfDayChange}
                  />
                  <label
                    htmlFor='halfDay'
                    className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Demi-journée
                  </label>
                </div>
                <p className='text-muted-foreground text-xs'>
                  Cochez cette case si votre congé ne dure qu'une demi-journée.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              dayjs(field.value)
                                .locale('fr')
                                .format('DD MMMM YYYY')
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          locale={fr}
                          mode='single'
                          selected={field.value}
                          onSelect={date => {
                            field.onChange(date)
                            if (
                              form.watch('endDate') &&
                              date &&
                              date > form.watch('endDate')
                            ) {
                              form.setValue('endDate', date)
                            }
                          }}
                          disabled={date =>
                            date < dayjs().subtract(1, 'day').toDate()
                          }
                          captionLayout='dropdown'
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='halfDayPeriod'
                render={({ field }) => (
                  <FormItem className={isHalfDay ? '' : 'hidden'}>
                    <FormLabel>Période</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Sélectionnez une période' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(halfDayPeriodLabels).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem className={isHalfDay ? 'hidden' : ''}>
                    <FormLabel>Date de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              dayjs(field.value)
                                .locale('fr')
                                .format('DD MMMM YYYY')
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          locale={fr}
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => date < startDate}
                          captionLayout='dropdown'
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
