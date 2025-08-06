'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LeaveBalanceHistoryType, LeaveType } from '@/generated/prisma'
import { useUpdateLeaveBalance } from '@/hooks/api/leave-balances/update-leave-balance'
import { leaveTypeLabels } from '@/lib/constants'
import { EditLeaveBalanceDialogProps } from '@/schemas/edit-leave-balance-dialog-schema'
import {
  UpdateLeaveBalanceInput,
  UpdateLeaveBalanceSchema,
} from '@/schemas/update-leave-balance-schema'
import { useCompanyStore } from '@/stores/use-company-store'

export const EditLeaveBalanceDialog = ({
  membership,
  trigger,
}: EditLeaveBalanceDialogProps) => {
  const [open, setOpen] = useState(false)
  const { activeCompany } = useCompanyStore()
  const updateLeaveBalance = useUpdateLeaveBalance()

  const form = useForm<UpdateLeaveBalanceInput>({
    resolver: zodResolver(UpdateLeaveBalanceSchema),
    defaultValues: {
      type: LeaveType.PAID,
      change: 0,
      reason: '',
      historyType: LeaveBalanceHistoryType.MANUEL_CREDIT,
    },
  })

  const onSubmit = async (values: UpdateLeaveBalanceInput) => {
    if (!activeCompany) {
      toast.error('Aucune entreprise sélectionnée')
      return
    }

    await updateLeaveBalance.mutateAsync(
      {
        companyId: activeCompany.id,
        membershipId: membership.id,
        data: values,
      },
      {
        onSuccess() {
          form.reset()
          toast.success('Solde de congés modifié avec succès')
          setOpen(false)
        },
        onError(error) {
          toast.error('Erreur lors de la modification du solde', {
            description: error.message,
          })
        },
      }
    )
  }

  const getCurrentBalance = (type: LeaveType) => {
    const balance = membership.leaveBalances?.find(b => b.type === type)
    return balance?.remainingDays || 0
  }

  const selectedType = form.watch('type')
  const change = form.watch('change')
  const currentBalance = getCurrentBalance(selectedType)
  const newBalance = currentBalance + change

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Modifier les congés</DialogTitle>
          <DialogDescription>
            Modifier le solde de congés pour{' '}
            {membership.user.name || membership.user.email}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 py-4'
          >
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
                        <SelectValue placeholder='Sélectionner un type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(leaveTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='bg-muted grid grid-cols-3 gap-4 rounded-lg p-3'>
              <div className='text-center'>
                <div className='text-muted-foreground text-sm'>
                  Solde actuel
                </div>
                <div className='font-semibold'>
                  {currentBalance.toFixed(1)} jours
                </div>
              </div>
              <div className='text-center'>
                <div className='text-muted-foreground text-sm'>
                  Modification
                </div>
                <div
                  className={`font-semibold ${
                    change > 0
                      ? 'text-green-600'
                      : change < 0
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)} jours
                </div>
              </div>
              <div className='text-center'>
                <div className='text-muted-foreground text-sm'>
                  Nouveau solde
                </div>
                <div
                  className={`font-semibold ${
                    newBalance < 0 ? 'text-red-600' : 'text-foreground'
                  }`}
                >
                  {newBalance.toFixed(1)} jours
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name='change'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modification (en jours)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.5'
                      placeholder='Ex: +5 ou -2.5'
                      {...field}
                      onChange={e =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison de la modification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        "Ex: Ajustement suite à un rachat de congés, correction d'erreur..."
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type='submit' disabled={updateLeaveBalance.isPending}>
                {updateLeaveBalance.isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
