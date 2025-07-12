import { NextRequest, NextResponse } from 'next/server'

import { LeaveStatus, UserRole } from '@/generated/prisma'
import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { CreateLeaveSchema } from '@/schemas/create-leave-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  try {
    const { membershipId } = await params
    const { user } = await requireAuth()

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
    })

    const userMembership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: membership?.companyId ?? '',
        },
      },
    })

    if (
      userMembership?.role !== UserRole.MANAGER &&
      (!membership || membership.userId !== user.id)
    ) {
      throw new ApiError('Accès refusé à ce compte salarié', 403)
    }

    const leaves = await prisma.leave.findMany({
      where: {
        membershipId,
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return NextResponse.json(leaves, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_LEAVES_FOR_USER')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  try {
    const { membershipId } = await params
    const { user } = await requireAuth()
    const json = await req.json()
    const body = CreateLeaveSchema.parse(json)

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
    })

    if (!membership || membership.userId !== user.id) {
      throw new ApiError('Accès refusé à ce compte salarié', 403)
    }

    const leave = await prisma.leave.create({
      data: {
        membershipId: membership.id,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason,
        status: LeaveStatus.PENDING,
      },
    })

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'API:CREATE_LEAVE')
  }
}
