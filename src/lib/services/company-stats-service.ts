import { User } from 'better-auth'

import { UserRole } from '@/generated/prisma'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { CompanyStats } from '@/schemas/company-stats-schema'
type AuthenticatedUser = Pick<User, 'id'>
async function getCompanyStats(
  companyId: string,
  user: AuthenticatedUser
): Promise<CompanyStats> {
  // Vérifier que l'utilisateur est manager de l'entreprise
  const requesterMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!requesterMembership || requesterMembership.role !== UserRole.MANAGER) {
    throw new ApiError(
      'Accès refusé : seuls les managers peuvent voir les statistiques',
      403
    )
  }

  // Calculer le nombre total d'employés
  const totalEmployees = await prisma.membership.count({
    where: {
      companyId,
    },
  })

  // Calculer le nombre d'employés actuellement en congé
  const now = new Date()
  const employeesOnLeave = await prisma.leave.count({
    where: {
      membership: {
        companyId,
      },
      status: 'APPROVED',
      startDate: {
        lte: now,
      },
      endDate: {
        gte: now,
      },
    },
  })

  // Calculer le nombre de demandes en attente
  const pendingRequests = await prisma.leave.count({
    where: {
      membership: {
        companyId,
      },
      status: 'PENDING',
    },
  })

  // Calculer le solde moyen de congés payés
  const leaveBalances = await prisma.leaveBalance.findMany({
    where: {
      membership: {
        companyId,
      },
      type: 'PAID',
    },
  })

  const averageLeaveBalance =
    leaveBalances.length > 0
      ? leaveBalances.reduce((sum, balance) => sum + balance.remainingDays, 0) /
        leaveBalances.length
      : 0

  return {
    totalEmployees,
    employeesOnLeave,
    pendingRequests,
    averageLeaveBalance: Math.round(averageLeaveBalance * 10) / 10, // Arrondir à 1 décimale
  }
}

export const companyStatsService = {
  getCompanyStats,
}
