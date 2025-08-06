import { z } from 'zod'

import { LeaveBalanceHistoryType, LeaveType } from '@/generated/prisma'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})

const leaveBalanceSchema = z.object({
  type: z.nativeEnum(LeaveType),
})

const leaveBalanceHistorySchema = z.object({
  id: z.string(),
  leaveBalanceId: z.string(),
  change: z.number(),
  reason: z.string().optional(),
  type: z.nativeEnum(LeaveBalanceHistoryType),
  createdAt: z.date(),
})

export const leaveBalanceHistoryWithActorAndTypeSchema =
  leaveBalanceHistorySchema.extend({
    actor: userSchema,
    leaveBalance: leaveBalanceSchema,
  })

export type LeaveBalanceHistoryWithActorAndTypeInput = z.infer<
  typeof leaveBalanceHistoryWithActorAndTypeSchema
>
