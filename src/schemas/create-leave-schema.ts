import { z } from 'zod'

import { LeaveType } from '@/generated/prisma'

export const CreateLeaveSchema = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().optional(),
})

export type CreateLeaveInput = z.infer<typeof CreateLeaveSchema>
