import { z } from 'zod'

export const CompanyStatsSchema = z.object({
  totalEmployees: z
    .number()
    .min(0, "Le nombre total d'employés doit être positif"),
  employeesOnLeave: z
    .number()
    .min(0, "Le nombre d'employés en congé doit être positif"),
  pendingRequests: z
    .number()
    .min(0, 'Le nombre de demandes en attente doit être positif'),
  averageLeaveBalance: z
    .number()
    .min(0, 'Le solde moyen de congés doit être positif'),
})

export type CompanyStats = z.infer<typeof CompanyStatsSchema>
