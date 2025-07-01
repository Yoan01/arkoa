import { z } from 'zod'

import { UserRole } from '@/generated/prisma'

export const UserCompanyRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
  isManager: z.boolean(),
})

export type UserCompanyRoleInput = z.infer<typeof UserCompanyRoleSchema>
