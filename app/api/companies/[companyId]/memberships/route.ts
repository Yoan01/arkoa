import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { InviteMemberSchema } from '@/schemas/invite-member-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

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

    const memberships = await prisma.membership.findMany({
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
      },
    })

    return NextResponse.json(memberships, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_MEMBERSHIPS')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()
    const json = await req.json()
    const body = InviteMemberSchema.parse(json)

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
        email: body.email,
      },
    })

    if (!existingUser) {
      throw new ApiError(
        'Aucun utilisateur trouvé avec cet email. Il doit d’abord créer un compte.',
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
      throw new ApiError(
        'Cet utilisateur est déjà membre de l’entreprise.',
        400
      )
    }

    const newMembership = await prisma.membership.create({
      data: {
        userId: existingUser.id,
        companyId,
        role: body.role,
      },
    })

    return NextResponse.json(newMembership, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'API:INVITE_MEMBER')
  }
}
