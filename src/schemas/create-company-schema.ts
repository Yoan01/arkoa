import { z } from 'zod'

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  logoUrl: z.string().optional(),
  annualLeaveDays: z
    .number()
    .min(25, 'Le nombre de jours de congés doit être égale ou supérieur à 25'),
})

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>
