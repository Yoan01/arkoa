'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icons } from '@/components/ui/icons'

interface GoogleComingSoonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoogleComingSoonDialog({
  open,
  onOpenChange,
}: GoogleComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-center'>
          <div className='bg-muted/50 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full'>
            <Icons.google className='h-5 w-5' />
          </div>
          <DialogTitle className='text-xl'>
            Connexion Google - Bientôt disponible !
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-base'>
            Nous travaillons actuellement sur l'intégration de la connexion avec
            Google pour vous offrir une expérience encore plus simple et rapide.
          </DialogDescription>
        </DialogHeader>

        <div className='bg-muted/50 my-4 rounded-lg border p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex-1'>
              <p className='text-sm font-medium'>En attendant, vous pouvez :</p>
              <ul className='text-muted-foreground mt-2 text-sm'>
                <li>• Créer un compte avec votre email</li>
                <li>• Vous connecter normalement</li>
                <li>• Profiter de toutes les fonctionnalités</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' className='w-full'>
              J'ai compris
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
