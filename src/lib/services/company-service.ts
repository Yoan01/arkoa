import { User } from 'better-auth'
import { z } from 'zod'

import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/schemas/create-company-schema'
import { UpdateCompanySchema } from '@/schemas/update-company-schema'

type AuthenticatedUser = Pick<User, 'id'>

async function getCompaniesForUser(user: AuthenticatedUser) {
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: {
      company: true,
    },
  })

  return memberships.map(m => ({
    ...m.company,
    userMembershipId: m.id,
    userRole: m.role,
  }))
}

async function createCompany(
  data: z.infer<typeof CreateCompanySchema>,
  user: AuthenticatedUser
) {
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

async function getCompanyById(companyId: string, user: AuthenticatedUser) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
    include: {
      company: true,
    },
  })

  if (!membership) {
    throw new ApiError('Entreprise non trouvée ou accès refusé', 403)
  }

  return membership.company
}

async function updateCompany(
  companyId: string,
  data: z.infer<typeof UpdateCompanySchema>,
  user: AuthenticatedUser
) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!membership || membership.role !== 'MANAGER') {
    throw new ApiError('Accès interdit', 403)
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: data.name,
      logoUrl: data.logoUrl,
      annualLeaveDays: data.annualLeaveDays,
    },
  })

  return {
    ...updatedCompany,
    userMembershipId: membership.id,
    userRole: membership.role,
  }
}

async function deleteCompany(companyId: string, user: AuthenticatedUser) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!membership || membership.role !== 'MANAGER') {
    throw new ApiError('Accès interdit', 403)
  }

  const membershipCount = await prisma.membership.count({
    where: {
      companyId,
    },
  })

  if (
    membershipCount > 1 ||
    (membershipCount === 1 && membership.role !== 'MANAGER')
  ) {
    throw new ApiError(
      "Impossible de supprimer l'entreprise : il ne doit rester qu'un manager pour supprimer l'entreprise",
      400
    )
  }

  await prisma.company.delete({
    where: { id: companyId },
  })
}

export const companyService = {
  getCompaniesForUser,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
}
