import { User } from 'better-auth'
import { z } from 'zod'

import {
  HalfDayPeriod,
  LeaveStatus,
  LeaveType,
  Prisma,
  UserRole,
} from '@/generated/prisma'
import dayjs from '@/lib/dayjs-config'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { CreateLeaveSchema } from '@/schemas/create-leave-schema'
import { GetCalendarLeavesParams } from '@/schemas/queries/calendar-leaves-schema'
import { ReviewLeaveSchema } from '@/schemas/review-leave-schema'
import { UpdateLeaveSchema } from '@/schemas/update-leave-schema'

type AuthenticatedUser = Pick<User, 'id'>

// Fonction utilitaire pour calculer le nombre de jours ouvrés
export const calculateWorkingDays = (
  startDate: Date,
  endDate: Date,
  halfDayPeriod?: HalfDayPeriod | null
): number => {
  let count = 0
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isSame(end, 'day') || current.isBefore(end, 'day')) {
    const dayOfWeek = current.day()
    // Exclure samedi (6) et dimanche (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current = current.add(1, 'day')
  }

  // Si c'est une demi-journée, diviser par 2
  return halfDayPeriod ? count * 0.5 : count
}

async function getLeavesForMembership(
  membershipId: string,
  user: AuthenticatedUser
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!membership) {
    throw new ApiError('Membre non trouvé', 404)
  }

  const requesterMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: membership.companyId,
      },
    },
  })

  if (
    requesterMembership?.role !== UserRole.MANAGER &&
    membership.userId !== user.id
  ) {
    throw new ApiError('Accès interdit', 403)
  }

  return prisma.leave.findMany({
    where: {
      membershipId,
    },
    orderBy: {
      startDate: 'desc',
    },
  })
}

async function createLeave(
  membershipId: string,
  data: z.infer<typeof CreateLeaveSchema>,
  user: AuthenticatedUser
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!membership || membership.userId !== user.id) {
    throw new ApiError('Accès refusé', 403)
  }

  // Check leave balance
  const leaveBalance = await prisma.leaveBalance.findFirst({
    where: {
      membershipId: membership.id,
      type: data.type,
    },
  })

  const workingDays = calculateWorkingDays(
    data.startDate,
    data.endDate,
    data.halfDayPeriod
  )

  if (!leaveBalance || leaveBalance.remainingDays < workingDays) {
    throw new ApiError('Solde de congés insuffisant', 400)
  }

  return prisma.leave.create({
    data: {
      membershipId: membership.id,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      halfDayPeriod: data.halfDayPeriod,
      reason: data.reason,
      status: LeaveStatus.PENDING,
    },
  })
}

async function reviewLeave(
  companyId: string,
  leaveId: string,
  data: z.infer<typeof ReviewLeaveSchema>,
  user: AuthenticatedUser
) {
  const manager = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!manager || manager.role !== 'MANAGER') {
    throw new ApiError("Accès refusé : vous n'êtes pas manager", 403)
  }

  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: {
      membership: true,
    },
  })

  if (!leave || leave.membership.companyId !== companyId) {
    throw new ApiError('Congé non trouvé ou non lié à cette entreprise', 404)
  }

  if (leave.status !== 'PENDING') {
    throw new ApiError('Seuls les congés en attente peuvent être revus', 400)
  }

  // Utiliser une transaction pour assurer la cohérence des données
  return prisma.$transaction(async tx => {
    // Mettre à jour le congé
    const updatedLeave = await tx.leave.update({
      where: { id: leave.id },
      data: {
        status: data.status,
        managerNote: data.managerNote,
        managerId: user.id,
        reviewedAt: dayjs().toDate(),
      },
    })

    // Si le congé est refusé et qu'il s'agit d'un type qui consomme des jours de solde
    if (
      data.status === LeaveStatus.REJECTED &&
      (leave.type === LeaveType.PAID || leave.type === LeaveType.RTT)
    ) {
      // Calculer le nombre de jours à restituer
      const daysToRestore = calculateWorkingDays(
        leave.startDate,
        leave.endDate,
        leave.halfDayPeriod
      )

      if (daysToRestore > 0) {
        // Chercher le solde existant
        let leaveBalance = await tx.leaveBalance.findUnique({
          where: {
            membershipId_type: {
              membershipId: leave.membershipId,
              type: leave.type,
            },
          },
        })

        if (leaveBalance) {
          // Mettre à jour le solde existant
          leaveBalance = await tx.leaveBalance.update({
            where: { id: leaveBalance.id },
            data: {
              remainingDays: leaveBalance.remainingDays + daysToRestore,
            },
          })
        } else {
          // Créer un nouveau solde si il n'existe pas
          leaveBalance = await tx.leaveBalance.create({
            data: {
              membershipId: leave.membershipId,
              type: leave.type,
              remainingDays: daysToRestore,
            },
          })
        }

        // Enregistrer l'historique de la restitution
        await tx.leaveBalanceHistory.create({
          data: {
            leaveBalanceId: leaveBalance.id,
            change: daysToRestore,
            reason: `Restitution suite au refus du congé du ${dayjs(leave.startDate).format('DD/MM/YYYY')} au ${dayjs(leave.endDate).format('DD/MM/YYYY')}`,
            actorId: user.id,
          },
        })
      }
    }

    return updatedLeave
  })
}

async function getCompanyLeaves(
  companyId: string,
  user: AuthenticatedUser,
  status?: LeaveStatus
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
    throw new ApiError("Accès refusé : vous n'êtes pas manager", 403)
  }

  const whereClause: Prisma.LeaveWhereInput = { membership: { companyId } }
  if (status) {
    whereClause.status = status
  }

  const leaves = await prisma.leave.findMany({
    where: whereClause,
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      halfDayPeriod: true,
      reason: true,
      status: true,
      createdAt: true,
      managerNote: true,
      membership: { select: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { startDate: 'desc' },
  })

  // Trier pour mettre les congés PENDING en premier
  return leaves.sort((a, b) => {
    if (a.status === LeaveStatus.PENDING && b.status !== LeaveStatus.PENDING)
      return -1
    if (a.status !== LeaveStatus.PENDING && b.status === LeaveStatus.PENDING)
      return 1
    // Si même statut, garder l'ordre par date de début (déjà trié)
    return 0
  })
}

async function updateLeave(
  companyId: string,
  membershipId: string,
  leaveId: string,
  data: z.infer<typeof UpdateLeaveSchema>,
  user: AuthenticatedUser
) {
  const requester = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!requester) {
    throw new ApiError('Accès interdit à cette entreprise', 403)
  }

  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: { membership: true },
  })

  if (!leave || leave.membershipId !== membershipId) {
    throw new ApiError('Congé non trouvé', 404)
  }

  if (leave.membership.companyId !== companyId) {
    throw new ApiError("Le congé n'appartient pas à cette entreprise", 403)
  }

  const isOwner = requester.id === leave.membershipId
  const isManager = requester.role === 'MANAGER'

  if (!isOwner && !isManager) {
    throw new ApiError('Accès interdit', 403)
  }

  if (leave.status !== 'PENDING') {
    throw new ApiError('Seuls les congés en attente peuvent être modifiés', 400)
  }

  return prisma.leave.update({
    where: { id: leave.id },
    data: {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      halfDayPeriod: data.halfDayPeriod || null,
      reason: data.reason,
      type: data.type,
    },
  })
}

async function deleteLeave(
  companyId: string,
  membershipId: string,
  leaveId: string,
  user: AuthenticatedUser
) {
  const requester = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!requester) {
    throw new ApiError('Accès interdit à cette entreprise', 403)
  }

  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: { membership: true },
  })

  if (!leave || leave.membershipId !== membershipId) {
    throw new ApiError('Congé non trouvé', 404)
  }

  if (leave.membership.companyId !== companyId) {
    throw new ApiError("Le congé n'appartient pas à cette entreprise", 403)
  }

  const isOwner = requester.id === leave.membershipId
  const isManager = requester.role === 'MANAGER'

  if (!isOwner && !isManager) {
    throw new ApiError('Accès interdit', 403)
  }

  if (leave.status !== 'PENDING') {
    throw new ApiError(
      'Seuls les congés en attente peuvent être supprimés',
      400
    )
  }

  await prisma.leave.delete({
    where: { id: leave.id },
  })
}

async function getLeaveStats(companyId: string, user: AuthenticatedUser) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!membership || membership.role !== 'MANAGER') {
    throw new ApiError("Accès refusé : vous n'êtes pas manager", 403)
  }

  const [totalCount, pendingCount, approvedCount, rejectedCount] =
    await Promise.all([
      prisma.leave.count({
        where: {
          membership: { companyId },
        },
      }),
      prisma.leave.count({
        where: {
          membership: { companyId },
          status: LeaveStatus.PENDING,
        },
      }),
      prisma.leave.count({
        where: {
          membership: { companyId },
          status: LeaveStatus.APPROVED,
        },
      }),
      prisma.leave.count({
        where: {
          membership: { companyId },
          status: LeaveStatus.REJECTED,
        },
      }),
    ])

  return {
    totalLeaves: totalCount,
    pendingLeaves: pendingCount,
    approvedLeaves: approvedCount,
    rejectedLeaves: rejectedCount,
  }
}

async function getCalendarLeaves(
  companyId: string,
  user: AuthenticatedUser,
  params?: GetCalendarLeavesParams
) {
  const membership = await prisma.membership.findFirst({
    where: {
      companyId,
      userId: user.id,
    },
  })

  if (!membership) {
    throw new ApiError('Membership not found', 404)
  }

  // Définir la période de recherche
  const year = params?.year || new Date().getFullYear()
  const month = params?.month

  let startDate: Date
  let endDate: Date

  if (month !== undefined) {
    // Si un mois est spécifié, récupérer les congés de ce mois
    startDate = new Date(year, month - 1, 1)
    endDate = new Date(year, month, 0) // Dernier jour du mois
  } else {
    // Sinon, récupérer les congés de toute l'année
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31)
  }

  const leaves = await prisma.leave.findMany({
    where: {
      membership: {
        companyId,
      },
      OR: [
        {
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          AND: [
            {
              startDate: {
                lte: startDate,
              },
            },
            {
              endDate: {
                gte: endDate,
              },
            },
          ],
        },
      ],
    },
    include: {
      membership: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  })

  return leaves
}

export const leaveService = {
  getLeavesForMembership,
  createLeave,
  reviewLeave,
  getCompanyLeaves,
  updateLeave,
  deleteLeave,
  getLeaveStats,
  getCalendarLeaves,
}
