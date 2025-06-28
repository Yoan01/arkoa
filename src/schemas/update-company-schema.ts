import { z } from 'zod'

export const UpdateCompanySchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
})

export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>
