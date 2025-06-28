import { z } from 'zod'

import { LeaveStatus } from '@/generated/prisma'

export const ReviewLeaveSchema = z.object({
  status: z.enum([LeaveStatus.APPROVED, LeaveStatus.REJECTED]),
  managerNote: z.string().optional(),
})

export type ReviewLeaveInput = z.infer<typeof ReviewLeaveSchema>
