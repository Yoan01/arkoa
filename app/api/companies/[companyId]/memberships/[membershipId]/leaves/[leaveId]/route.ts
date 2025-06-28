import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { UpdateLeaveSchema } from '@/schemas/update-leave-schema'

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: { companyId: string; membershipId: string; leaveId: string } }
) {
  try {
    const { user } = await requireAuth()
    const body = UpdateLeaveSchema.parse(await req.json())

    // Vérifie que l'utilisateur est membre de l'entreprise
    const requester = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: params.companyId,
        },
      },
    })

    if (!requester) {
      throw new ApiError('Accès interdit à cette entreprise', 403)
    }

    // Récupération du congé
    const leave = await prisma.leave.findUnique({
      where: { id: params.leaveId },
      include: { membership: true },
    })

    if (!leave || leave.membershipId !== params.membershipId) {
      throw new ApiError('Congé introuvable', 404)
    }

    if (leave.membership.companyId !== params.companyId) {
      throw new ApiError("Le congé n'appartient pas à cette entreprise", 403)
    }

    // Seul le propriétaire du leave ou un MANAGER peut modifier
    const isOwner = requester.id === leave.membershipId
    const isManager = requester.role === 'MANAGER'

    if (!isOwner && !isManager) {
      throw new ApiError('Accès interdit', 403)
    }

    if (leave.status !== 'PENDING') {
      throw new ApiError(
        'Seuls les congés en attente peuvent être modifiés',
        400
      )
    }

    const updatedLeave = await prisma.leave.update({
      where: { id: leave.id },
      data: {
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        reason: body.reason,
        type: body.type,
      },
    })

    return NextResponse.json(updatedLeave, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_LEAVE')
  }
}

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: { params: { companyId: string; membershipId: string; leaveId: string } }
) {
  try {
    const { user } = await requireAuth()

    const requester = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: params.companyId,
        },
      },
    })

    if (!requester) {
      throw new ApiError('Accès interdit à cette entreprise', 403)
    }

    const leave = await prisma.leave.findUnique({
      where: { id: params.leaveId },
      include: { membership: true },
    })

    if (!leave || leave.membershipId !== params.membershipId) {
      throw new ApiError('Congé introuvable', 404)
    }

    if (leave.membership.companyId !== params.companyId) {
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

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:DELETE_LEAVE')
  }
}
