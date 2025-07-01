import { z } from 'zod'

export const UserCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  membershipId: z.string(),
  isManager: z.boolean(),
})

export const UserCompaniesResponseSchema = z.array(UserCompanySchema)

export type UserCompanyInput = z.infer<typeof UserCompanySchema>
