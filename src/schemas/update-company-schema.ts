import { z } from 'zod'

export const UpdateCompanySchema = z.object({
  id: z.string().min(1, "L'id de l'entreprise est requis"),
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  logoUrl: z.string().optional(),
})

export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>
