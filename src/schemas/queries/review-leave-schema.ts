import { z } from 'zod'

import { LeaveStatus } from '@/generated/prisma'

export const reviewLeaveParamsSchema = z.object({
  companyId: z.string(),
  leaveId: z.string(),
  action: z.enum([LeaveStatus.APPROVED, LeaveStatus.REJECTED]),
  managerNote: z.string().optional(),
})

export type ReviewLeaveParams = z.infer<typeof reviewLeaveParamsSchema>
