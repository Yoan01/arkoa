'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { LeaveStatus } from '@/generated/prisma'
import { useReviewLeave } from '@/hooks/api/leaves/review-leave'
import { CompanyLeave } from '@/schemas/queries/company-leaves-schema'
import { useCompanyStore } from '@/stores/use-company-store'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Textarea } from '../ui/textarea'
import { TooltipProvider } from '../ui/tooltip'

const reviewLeaveSchema = z.object({
  managerNote: z.string().optional(),
})

type ReviewLeaveFormData = z.infer<typeof reviewLeaveSchema>

interface ReviewLeaveDialogProps {
  leave: CompanyLeave
  action: typeof LeaveStatus.APPROVED | typeof LeaveStatus.REJECTED
  trigger: React.ReactNode
}

export const ReviewLeaveDialog: React.FC<ReviewLeaveDialogProps> = ({
  leave,
  action,
  trigger,
}) => {
  const [open, setOpen] = useState(false)
  const { activeCompany } = useCompanyStore()
  const reviewLeave = useReviewLeave()

  const form = useForm<ReviewLeaveFormData>({
    resolver: zodResolver(reviewLeaveSchema),
    defaultValues: {
      managerNote: '',
    },
  })

  const onSubmit = async (values: ReviewLeaveFormData) => {
    if (!activeCompany?.id) return

    reviewLeave.mutate(
      {
        companyId: activeCompany.id,
        leaveId: leave.id,
        action,
        managerNote: values.managerNote,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset()
        },
      }
    )
  }

  const isApproval = action === LeaveStatus.APPROVED
  const actionText = isApproval ? 'Approuver' : 'Rejeter'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{actionText} la demande de congé</DialogTitle>
          <DialogDescription>
            Demande de {leave.membership.user.name} du{' '}
            {new Date(leave.startDate).toLocaleDateString('fr-FR')} au{' '}
            {new Date(leave.endDate).toLocaleDateString('fr-FR')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='managerNote'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Commentaire {isApproval ? '(optionnel)' : '(recommandé)'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Ajoutez un commentaire pour ${isApproval ? "l'approbation" : 'le refus'}...`}
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={reviewLeave.isPending}
              >
                Annuler
              </Button>
              <Button
                type='submit'
                disabled={reviewLeave.isPending}
                className={`${
                  isApproval
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewLeave.isPending
                  ? `${actionText.slice(0, -1)}ation...`
                  : actionText}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export const ApprovalActions = ({ leave }: { leave: CompanyLeave }) => {
  if (leave.status !== 'PENDING') {
    return (
      <div className='flex flex-col gap-1'>
        {leave.managerNote ? (
          <span className='text-xs text-gray-400 italic'>
            "{leave.managerNote}"
          </span>
        ) : (
          <span className='text-xs text-gray-400'>Aucun commentaire</span>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className='flex gap-2'>
        <ReviewLeaveDialog
          leave={leave}
          action={LeaveStatus.APPROVED}
          trigger={
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700'
            >
              <CheckIcon className='h-4 w-4' />
            </Button>
          }
        />

        <ReviewLeaveDialog
          leave={leave}
          action={LeaveStatus.REJECTED}
          trigger={
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700'
            >
              <XIcon className='h-4 w-4' />
            </Button>
          }
        />
      </div>
    </TooltipProvider>
  )
}
