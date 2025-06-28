import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { ReviewLeaveSchema } from '@/schemas/review-leave-schema'

export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string; leaveId: string } }
) {
  try {
    const { user } = await requireAuth()
    const body = ReviewLeaveSchema.parse(await req.json())

    const manager = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: params.companyId,
        },
      },
    })

    if (!manager || manager.role !== 'MANAGER') {
      throw new ApiError("Accès interdit : vous n'êtes pas manager", 403)
    }

    const leave = await prisma.leave.findUnique({
      where: { id: params.leaveId },
      include: {
        membership: true,
      },
    })

    if (!leave || leave.membership.companyId !== params.companyId) {
      throw new ApiError('Congé introuvable ou non lié à cette entreprise', 404)
    }

    if (leave.status !== 'PENDING') {
      throw new ApiError('Seuls les congés en attente peuvent être revus', 400)
    }

    const reviewedLeave = await prisma.leave.update({
      where: { id: leave.id },
      data: {
        status: body.status,
        managerNote: body.managerNote,
        managerId: user.id,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(reviewedLeave, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:REVIEW_LEAVE')
  }
}
