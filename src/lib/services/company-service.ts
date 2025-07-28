import { User } from 'better-auth'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/schemas/create-company-schema'

// On peut définir un type pour l'utilisateur authentifié si besoin
type AuthenticatedUser = Pick<User, 'id'>

async function createCompany(
  data: z.infer<typeof CreateCompanySchema>,
  user: AuthenticatedUser
) {
  // La logique métier est maintenant ici
  const company = await prisma.company.create({
    data: {
      name: data.name,
      logoUrl: data.logoUrl,
      annualLeaveDays: data.annualLeaveDays,
      memberships: {
        create: {
          userId: user.id,
          role: 'MANAGER',
        },
      },
    },
    include: {
      memberships: {
        where: { userId: user.id },
      },
    },
  })

  const userMembership = company.memberships.find(m => m.userId === user.id)

  return {
    ...company,
    userMembershipId: userMembership?.id ?? null,
  }
}

export const companyService = {
  createCompany,
}
