import { ReactNode } from 'react'
import { z } from 'zod'

import { membershipWithUserSchema } from './queries/membership-with-user-schema'

// Schéma pour les soldes de congés
const leaveBalanceSchema = z.object({
  id: z.string(),
  type: z.string(),
  remainingDays: z.number(),
})

// Schéma pour l'adhésion avec utilisateur et soldes de congés
export const membershipWithUserAndBalancesSchema =
  membershipWithUserSchema.extend({
    leaveBalances: z.array(leaveBalanceSchema).optional(),
  })

export type MembershipWithUserAndBalances = z.infer<
  typeof membershipWithUserAndBalancesSchema
>

// Interface pour les props du dialogue (ReactNode ne peut pas être validé par Zod)
export interface EditLeaveBalanceDialogProps {
  membership: MembershipWithUserAndBalances
  trigger: ReactNode
}
