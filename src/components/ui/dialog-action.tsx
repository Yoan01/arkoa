import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

import { buttonVariants } from './button'

interface Props {
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  onClick: () => void
  children?: React.ReactNode
  disabled?: boolean
  type?: 'default' | 'destructive'
}

export const DialogAction = ({
  onClick,
  children,
  description,
  title,
  disabled,
  type = 'destructive',
}: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? 'Êtes-vous sur ?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? 'Cette action ne peut pas être annulée.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled}
            onClick={onClick}
            className={cn(buttonVariants({ variant: type }))}
          >
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
