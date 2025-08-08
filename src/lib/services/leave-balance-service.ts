import { z } from 'zod'

import { UserRole } from '@/generated/prisma'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { AuthenticatedUser } from '@/lib/types/auth'
import { UpdateLeaveBalanceSchema } from '@/schemas/update-leave-balance-schema'

async function getLeaveBalances(membershipId: string, user: AuthenticatedUser) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!membership) {
    throw new ApiError('Membre non trouvé', 404)
  }

  const requesterMembership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      companyId: membership.companyId,
    },
  })

  if (
    !requesterMembership ||
    (requesterMembership.role !== 'MANAGER' && membership.userId !== user.id)
  ) {
    throw new ApiError('Accès refusé', 403)
  }

  return prisma.leaveBalance.findMany({
    where: {
      membershipId,
    },
  })
}

async function updateLeaveBalance(
  companyId: string,
  membershipId: string,
  data: z.infer<typeof UpdateLeaveBalanceSchema>,
  user: AuthenticatedUser
) {
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
      'Accès refusé : seuls les managers peuvent modifier les soldes de congés',
      403
    )
  }

  // Vérifier que le membership existe et appartient à l'entreprise
  const targetMembership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!targetMembership || targetMembership.companyId !== companyId) {
    throw new ApiError('Employé non trouvé dans cette entreprise', 404)
  }

  // Trouver ou créer le solde de congés
  const existingBalance = await prisma.leaveBalance.findUnique({
    where: {
      membershipId_type: {
        membershipId,
        type: data.type,
      },
    },
  })

  let leaveBalance
  if (existingBalance) {
    // Mettre à jour le solde existant
    leaveBalance = await prisma.leaveBalance.update({
      where: { id: existingBalance.id },
      data: {
        remainingDays: existingBalance.remainingDays + data.change,
      },
    })
  } else {
    // Créer un nouveau solde
    leaveBalance = await prisma.leaveBalance.create({
      data: {
        membershipId,
        type: data.type,
        remainingDays: Math.max(0, data.change), // Ne pas permettre de solde négatif lors de la création
      },
    })
  }

  // Enregistrer l'historique
  await prisma.leaveBalanceHistory.create({
    data: {
      leaveBalanceId: leaveBalance.id,
      change: data.change,
      reason: data.reason,
      type: data.historyType,
      actorId: user.id,
    },
  })

  return leaveBalance
}

async function getLeaveBalanceHistory(
  membershipId: string,
  user: AuthenticatedUser
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!membership) {
    throw new ApiError('Membre non trouvé', 404)
  }

  const requesterMembership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      companyId: membership.companyId,
    },
  })

  if (
    !requesterMembership ||
    (requesterMembership.role !== 'MANAGER' && membership.userId !== user.id)
  ) {
    throw new ApiError('Accès refusé', 403)
  }

  const history = await prisma.leaveBalanceHistory.findMany({
    where: {
      leaveBalance: {
        membershipId,
      },
    },
    include: {
      leaveBalance: {
        select: {
          type: true,
        },
      },
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return history
}

export const leaveBalanceService = {
  getLeaveBalances,
  updateLeaveBalance,
  getLeaveBalanceHistory,
}
