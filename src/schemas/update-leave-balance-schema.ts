import { z } from 'zod'

import { LeaveType } from '@/generated/prisma'

export const UpdateLeaveBalanceSchema = z.object({
  type: z.nativeEnum(LeaveType),
  change: z
    .number()
    .multipleOf(
      0.5,
      'La modification doit être un multiple de 0,5 (demi-journée)'
    )
    .min(-365, 'La modification ne peut pas être inférieure à -365 jours')
    .max(365, 'La modification ne peut pas être supérieure à 365 jours'),
  reason: z.string().min(1, 'La raison est requise'),
})

export type UpdateLeaveBalanceInput = z.infer<typeof UpdateLeaveBalanceSchema>
