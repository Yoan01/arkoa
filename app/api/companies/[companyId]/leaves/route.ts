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

    const leaves = await prisma.leave.findMany({
      where: { membership: { companyId } },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        membership: { select: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json(leaves, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_COMPANY_LEAVES')
  }
}
