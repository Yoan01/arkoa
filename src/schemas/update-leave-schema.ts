import { z } from 'zod'

import { LeaveType } from '@/generated/prisma'

export const UpdateLeaveSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().optional(),
  type: z.nativeEnum(LeaveType),
})

export type UpdateLeaveInput = z.infer<typeof UpdateLeaveSchema>
