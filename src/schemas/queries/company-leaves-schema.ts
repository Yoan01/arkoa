import { z } from 'zod'

import { LeaveStatus } from '@/generated/prisma'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const membershipSchema = z.object({
  user: userSchema,
})

export const companyLeaveSchema = z.object({
  id: z.string(),
  type: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().nullable().optional(),
  status: z.nativeEnum(LeaveStatus),
  createdAt: z.date(),
  managerNote: z.string().nullable().optional(),
  membership: membershipSchema,
})

export const getCompanyLeavesParamsSchema = z.object({
  companyId: z.string(),
  status: z.nativeEnum(LeaveStatus).optional(),
})

export const getCompanyLeavesResponseSchema = z.array(companyLeaveSchema)

export type CompanyLeave = z.infer<typeof companyLeaveSchema>
export type GetCompanyLeavesParams = z.infer<
  typeof getCompanyLeavesParamsSchema
>
export type GetCompanyLeavesResponse = z.infer<
  typeof getCompanyLeavesResponseSchema
>
