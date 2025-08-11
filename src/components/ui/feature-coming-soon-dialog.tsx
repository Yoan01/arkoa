'use client'

import { Clock } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FeatureComingSoonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureName: string
}

export function FeatureComingSoonDialog({
  open,
  onOpenChange,
  featureName,
}: FeatureComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <Clock className='h-5 w-5 text-blue-600' />
            <DialogTitle>Fonctionnalité à venir</DialogTitle>
          </div>
          <DialogDescription className='text-left'>
            La fonctionnalité <strong>{featureName}</strong> sera bientôt
            disponible ! Nous travaillons activement sur son développement.
          </DialogDescription>
        </DialogHeader>
        <div className='text-muted-foreground flex flex-col gap-2 text-sm'>
          <p>En attendant, vous pouvez :</p>
          <ul className='ml-2 list-inside list-disc space-y-1'>
            <li>Continuer à utiliser les fonctionnalités actuelles</li>
            <li>Nous faire part de vos suggestions</li>
            <li>Rester informé des mises à jour</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
