import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { UserRole } from '@/generated/prisma'
import { useInviteMembership } from '@/hooks/api/memberships/invite-membership'
import {
  InviteMemberInput,
  InviteMemberSchema,
} from '@/schemas/invite-member-schema'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { SidebarMenuButton } from '../ui/sidebar'

interface Props {
  companyId: string
  children?: React.ReactNode
}

export function InviteUserDialog({ companyId }: Props) {
  const [open, setOpen] = useState(false)
  const inviteMember = useInviteMembership()

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(InviteMemberSchema),
    defaultValues: {
      email: '',
      role: UserRole.EMPLOYEE,
    },
  })

  const onSubmit = async (values: InviteMemberInput) => {
    await inviteMember.mutateAsync(
      { companyId, data: { email: values.email, role: values.role } },
      {
        onSuccess() {
          form.reset()
          toast.success('Invitation envoyée avec succès')
          setOpen(false)
        },
        onError(error) {
          toast.error("Erreur lors de l'envoi de l'invitation", {
            description: error.message,
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip='Quick Create'
          className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
        >
          <PlusCircleIcon />
          <span>Inviter un membre</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
          <DialogDescription>
            Envoyer une invitation par email à un nouveau membre
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 py-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='email@exemple.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Sélectionner un rôle' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.EMPLOYEE}>Employé</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>Envoyer l'invitation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
