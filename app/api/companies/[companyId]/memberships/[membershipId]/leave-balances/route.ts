import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { UpdateLeaveBalancesSchema } from '@/schemas/update-leave-balances-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  try {
    const { membershipId } = await params
    const { user } = await requireAuth()

    const targetMembership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: { company: true },
    })

    if (!targetMembership) {
      throw new ApiError('Membre introuvable', 404)
    }

    const requesterMembership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: targetMembership.companyId,
        },
      },
    })

    const isSelf = targetMembership.userId === user.id
    const isManager = requesterMembership?.role === 'MANAGER'

    if (!isSelf && !isManager) {
      throw new ApiError('Accès refusé', 403)
    }

    const balances = await prisma.leaveBalance.findMany({
      where: {
        membershipId,
      },
      orderBy: {
        type: 'asc',
      },
    })

    return NextResponse.json(balances, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_LEAVE_BALANCES')
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; membershipId: string }> }
) {
  try {
    const { companyId, membershipId } = await params
    const { user } = await requireAuth()
    const { balances } = UpdateLeaveBalancesSchema.parse(await req.json())

    // Vérifie que l'utilisateur est MANAGER de l'entreprise
    const manager = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
    })

    if (!manager || manager.role !== 'MANAGER') {
      throw new ApiError(
        'Accès refusé : seuls les managers peuvent modifier les soldes',
        403
      )
    }

    // Vérifie que le membre appartient à la même entreprise
    const targetMembership = await prisma.membership.findUnique({
      where: { id: membershipId },
    })

    if (!targetMembership || targetMembership.companyId !== companyId) {
      throw new ApiError(
        'Ce membre ne fait pas partie de cette entreprise',
        403
      )
    }

    const results = await Promise.all(
      balances.map(balance =>
        prisma.leaveBalance.upsert({
          where: {
            membershipId_type: {
              membershipId,
              type: balance.type,
            },
          },
          update: {
            remainingDays: balance.remainingDays,
          },
          create: {
            membershipId,
            type: balance.type,
            remainingDays: balance.remainingDays,
          },
        })
      )
    )

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_LEAVE_BALANCES')
  }
}
