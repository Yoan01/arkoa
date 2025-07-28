import { z } from 'zod'

import { LeaveType } from '@/generated/prisma'

export const UpdateLeaveSchema = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
})

export type UpdateLeaveInput = z.infer<typeof UpdateLeaveSchema>
