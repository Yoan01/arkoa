import { z } from 'zod'

import { UserRole } from '@/generated/prisma'

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
})

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>
