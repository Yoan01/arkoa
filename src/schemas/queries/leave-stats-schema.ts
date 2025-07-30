import { z } from 'zod'

export const getLeaveStatsParamsSchema = z.object({
  companyId: z.string(),
})

export const leaveStatsResponseSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
})

export type GetLeaveStatsParams = z.infer<typeof getLeaveStatsParamsSchema>
export type LeaveStatsResponse = z.infer<typeof leaveStatsResponseSchema>
