import { z } from 'zod'

export const CreateCompanySchema = z
  .object({
    name: z.string().trim().min(1, 'Le nom est requis'),
    logoUrl: z.string().optional(),
    annualLeaveDays: z
      .number()
      .min(
        25,
        'Le nombre de jours de congés doit être égale ou supérieur à 25'
      ),
  })
  .strict()

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>
