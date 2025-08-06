import { z } from 'zod'

export const getLeaveStatsParamsSchema = z.object({
  companyId: z.string(),
})

export const leaveStatsResponseSchema = z.object({
  pendingLeaves: z.number(),
  approvedLeaves: z.number(),
  rejectedLeaves: z.number(),
})

export type GetLeaveStatsParams = z.infer<typeof getLeaveStatsParamsSchema>
export type LeaveStatsResponse = z.infer<typeof leaveStatsResponseSchema>
