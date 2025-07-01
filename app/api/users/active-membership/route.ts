import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { SetActiveMembershipSchema } from '@/schemas/set-active-membership-schema'

export async function GET(_req: NextRequest) {
  try {
    const { user } = await requireAuth()

    const userWithActiveMembership = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        activeMembership: {
          include: {
            company: true,
          },
        },
      },
    })

    if (!userWithActiveMembership?.activeMembership) {
      return new NextResponse('No active membership found', { status: 404 })
    }

    return NextResponse.json(
      userWithActiveMembership.activeMembership.company,
      {
        status: 200,
      }
    )
  } catch (error) {
    return handleApiError(error, 'API:GET_ACTIVE_MEMBERSHIP')
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth()
    const json = await req.json()
    const { membershipId } = SetActiveMembershipSchema.parse(json)

    // Vérifie que le membership appartient bien à l'utilisateur connecté
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: { userId: true },
    })

    if (!membership || membership.userId !== user.id) {
      return new NextResponse('Forbidden: Invalid membership', { status: 403 })
    }

    // Met à jour l'entreprise active
    await prisma.user.update({
      where: { id: user.id },
      data: {
        activeMembershipId: membershipId,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:PATCH_ACTIVE_MEMBERSHIP')
  }
}
