import { z } from 'zod'

import { UserRole } from '@/generated/prisma'

export const UpdateMembershipSchema = z.object({
  role: z.nativeEnum(UserRole),
})

export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>
