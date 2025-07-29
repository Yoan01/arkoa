import { User } from 'better-auth'
import { z } from 'zod'

import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { InviteMemberSchema } from '@/schemas/invite-member-schema'
import { UpdateMembershipSchema } from '@/schemas/update-membership-schema'

type AuthenticatedUser = Pick<User, 'id'>

async function getMemberships(companyId: string, user: AuthenticatedUser) {
  const currentMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!currentMembership) {
    throw new ApiError('Accès interdit', 403)
  }

  return prisma.membership.findMany({
    where: {
      companyId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      leaveBalances: {
        select: {
          id: true,
          type: true,
          remainingDays: true,
        },
      },
    },
  })
}

async function getMembershipById(
  companyId: string,
  membershipId: string,
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

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: true },
  })

  if (!membership || membership.companyId !== companyId) {
    throw new ApiError('Membre non trouvé', 404)
  }

  return membership
}

async function inviteMember(
  companyId: string,
  data: z.infer<typeof InviteMemberSchema>,
  user: AuthenticatedUser
) {
  const currentMembership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId,
      },
    },
  })

  if (!currentMembership || currentMembership.role !== 'MANAGER') {
    throw new ApiError('Seuls les managers peuvent inviter', 403)
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  })

  if (!existingUser) {
    throw new ApiError(
      "Aucun utilisateur trouvé avec cet email. Il doit d'abord créer un compte.",
      400
    )
  }

  const alreadyMember = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId: existingUser.id,
        companyId,
      },
    },
  })

  if (alreadyMember) {
    throw new ApiError("Cet utilisateur est déjà membre de l'entreprise.", 400)
  }

  return prisma.membership.create({
    data: {
      userId: existingUser.id,
      companyId,
      role: data.role,
    },
  })
}

async function updateMembership(
  companyId: string,
  membershipId: string,
  data: z.infer<typeof UpdateMembershipSchema>,
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

  if (!requester || requester.role !== 'MANAGER') {
    throw new ApiError('Seul un manager peut modifier les rôles', 403)
  }

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!membership || membership.companyId !== companyId) {
    throw new ApiError('Membre non trouvé', 404)
  }

  return prisma.membership.update({
    where: { id: membershipId },
    data: { role: data.role },
  })
}

async function deleteMembership(
  companyId: string,
  membershipId: string,
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

  if (!requester || requester.role !== 'MANAGER') {
    throw new ApiError('Seul un manager peut supprimer un membre', 403)
  }

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })

  if (!membership || membership.companyId !== companyId) {
    throw new ApiError('Membre non trouvé', 404)
  }

  await prisma.membership.delete({
    where: { id: membershipId },
  })
}

export const membershipService = {
  getMemberships,
  getMembershipById,
  inviteMember,
  updateMembership,
  deleteMembership,
}
