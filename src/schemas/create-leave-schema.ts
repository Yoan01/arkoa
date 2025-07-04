import { z } from 'zod'

import { LeaveType } from '@/generated/prisma'

export const CreateLeaveSchema = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
})

export type CreateLeaveInput = z.infer<typeof CreateLeaveSchema>
