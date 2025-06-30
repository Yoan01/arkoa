import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    // Vérifie que l'utilisateur est bien membre de l'entreprise
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

    // Récupère tous les congés approuvés de l’entreprise
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

    // Format des événements pour le calendrier
    const calendarEvents = leaves.map(leave => ({
      id: leave.id,
      title: `${leave.membership.user.name} - ${leave.type}`,
      start: leave.startDate,
      end: leave.endDate,
      userId: leave.membership.user.id,
      membershipId: leave.membership.id,
      type: leave.type,
    }))

    return NextResponse.json(calendarEvents, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_LEAVE_CALENDAR')
  }
}
