import { User } from 'better-auth'

import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

type AuthenticatedUser = Pick<User, 'id'>

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

export const leaveBalanceService = {
  getLeaveBalances,
}
