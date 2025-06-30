import { z } from 'zod'

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  logoUrl: z.string().url().optional(),
})

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>
