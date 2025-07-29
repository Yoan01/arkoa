import { z } from 'zod'

import { UserRole } from '@/generated/prisma'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyId: z.string(),
  role: z.nativeEnum(UserRole),
  onLeave: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const companySchema = z.object({
  name: z.string(),
  createdAt: z.date(),
})

export const membershipWithUserAndCompanySchema = membershipSchema.extend({
  user: userSchema,
  company: companySchema,
})

export type MembershipWithUserAndCompanyInput = z.infer<
  typeof membershipWithUserAndCompanySchema
>
