import { z } from 'zod'

import { HalfDayPeriod, LeaveType } from '@/generated/prisma'

export const CreateLeaveSchema = z
  .object({
    type: z.nativeEnum(LeaveType),
    startDate: z.date(),
    endDate: z.date(),
    halfDayPeriod: z.nativeEnum(HalfDayPeriod).optional(),
    reason: z.string().optional(),
  })
  .refine(
    data => {
      if (data.halfDayPeriod) {
        return data.startDate.toDateString() === data.endDate.toDateString()
      }
      return true
    },
    {
      message: 'Pour une demi-journée, vous devez sélectionner une seule date',
      path: ['halfDayPeriod'],
    }
  )

export type CreateLeaveInput = z.infer<typeof CreateLeaveSchema>
