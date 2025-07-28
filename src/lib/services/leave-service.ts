import { User } from 'better-auth'
import { z } from 'zod'

import { LeaveStatus, UserRole } from '@/generated/prisma'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { CreateLeaveSchema } from '@/schemas/create-leave-schema'
import { ReviewLeaveSchema } from '@/schemas/review-leave-schema'
import { UpdateLeaveSchema } from '@/schemas/update-leave-schema'

type AuthenticatedUser = Pick<User, 'id'>

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
    throw new ApiError('Accès refusé à ce compte salarié', 403)
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
    throw new ApiError('Accès refusé à ce compte salarié', 403)
  }

  return prisma.leave.create({
    data: {
      membershipId: membership.id,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
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
    throw new ApiError("Accès interdit : vous n'êtes pas manager", 403)
  }

  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: {
      membership: true,
    },
  })

  if (!leave || leave.membership.companyId !== companyId) {
    throw new ApiError('Congé introuvable ou non lié à cette entreprise', 404)
  }

  if (leave.status !== 'PENDING') {
    throw new ApiError('Seuls les congés en attente peuvent être revus', 400)
  }

  return prisma.leave.update({
    where: { id: leave.id },
    data: {
      status: data.status,
      managerNote: data.managerNote,
      managerId: user.id,
      reviewedAt: new Date(),
    },
  })
}

async function getCompanyLeaves(companyId: string, user: AuthenticatedUser) {
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

  return prisma.leave.findMany({
    where: { membership: { companyId } },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      membership: { select: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { startDate: 'desc' },
  })
}

async function getLeaveCalendar(companyId: string, user: AuthenticatedUser) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!membership) {
    throw new ApiError('Accès refusé à cette entreprise', 403)
  }

  const leaves = await prisma.leave.findMany({
    where: {
      membership: {
        companyId,
      },
      status: 'APPROVED',
    },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      membership: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  })

  return leaves.map(leave => ({
    id: leave.id,
    title: `${leave.membership.user.name} - ${leave.type}`,
    start: leave.startDate,
    end: leave.endDate,
    userId: leave.membership.user.id,
    membershipId: leave.membership.id,
    type: leave.type,
  }))
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
    throw new ApiError('Congé introuvable', 404)
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
    throw new ApiError('Congé introuvable', 404)
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

export const leaveService = {
  getLeavesForMembership,
  createLeave,
  reviewLeave,
  getCompanyLeaves,
  getLeaveCalendar,
  updateLeave,
  deleteLeave,
}
