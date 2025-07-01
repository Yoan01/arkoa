import { z } from 'zod'

export const SetActiveMembershipSchema = z.object({
  membershipId: z.string().uuid(),
})

export type SetActiveMembershipInput = z.infer<typeof SetActiveMembershipSchema>
