import { z } from 'zod'

export const SetActiveMembershipSchema = z.object({
  membershipId: z.string().uuid().nullable(),
})

export type SetActiveMembershipInput = z.infer<typeof SetActiveMembershipSchema>
