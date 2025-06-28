import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { UpdateMembershipSchema } from '@/schemas/update-membership-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: { companyId: string; membershipId: string } }
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

    const membership = await prisma.membership.findUnique({
      where: { id: params.membershipId },
      include: { user: true },
    })

    if (!membership || membership.companyId !== params.companyId) {
      throw new ApiError('Membre non trouvé', 404)
    }

    return NextResponse.json(membership, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_MEMBERSHIP')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string; membershipId: string } }
) {
  try {
    const { user } = await requireAuth()
    const body = UpdateMembershipSchema.parse(await req.json())

    const requester = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: params.companyId,
        },
      },
    })

    if (!requester || requester.role !== 'MANAGER') {
      throw new ApiError('Seul un manager peut modifier les rôles', 403)
    }

    const membership = await prisma.membership.findUnique({
      where: { id: params.membershipId },
    })

    if (!membership || membership.companyId !== params.companyId) {
      throw new ApiError('Membre non trouvé', 404)
    }

    const updated = await prisma.membership.update({
      where: { id: params.membershipId },
      data: { role: body.role },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_MEMBERSHIP')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { companyId: string; membershipId: string } }
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

    if (!requester || requester.role !== 'MANAGER') {
      throw new ApiError('Seul un manager peut supprimer un membre', 403)
    }

    const membership = await prisma.membership.findUnique({
      where: { id: params.membershipId },
    })

    if (!membership || membership.companyId !== params.companyId) {
      throw new ApiError('Membre non trouvé', 404)
    }

    await prisma.membership.delete({
      where: { id: params.membershipId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, 'API:DELETE_MEMBERSHIP')
  }
}
