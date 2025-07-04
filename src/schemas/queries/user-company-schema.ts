import { z } from 'zod'

import { UserRole } from '@/generated/prisma'

export const UserCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable(),
  annualLeaveDays: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userMembershipId: z.string(),
  userRole: z.nativeEnum(UserRole),
})

export const UserCompaniesResponseSchema = z.array(UserCompanySchema)

export type UserCompanyInput = z.infer<typeof UserCompanySchema>
