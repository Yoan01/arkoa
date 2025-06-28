import { z } from 'zod'

import { LeaveType } from '@/generated/prisma'

export const UpdateLeaveBalancesSchema = z.object({
  balances: z
    .array(
      z.object({
        type: z.nativeEnum(LeaveType),
        remainingDays: z.number().min(0),
      })
    )
    .nonempty(),
})

export type UpdateLeaveBalancesInput = z.infer<typeof UpdateLeaveBalancesSchema>
