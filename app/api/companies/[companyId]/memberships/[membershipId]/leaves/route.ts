import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveService } from '@/lib/services/leave-service'
import { CreateLeaveSchema } from '@/schemas/create-leave-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  try {
    const { membershipId } = await params
    const { user } = await requireAuth()

    const leaves = await leaveService.getLeavesForMembership(membershipId, user)

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
    const bodyToValidate = {
      ...json,
      startDate: new Date(json.startDate),
      endDate: new Date(json.endDate),
    }
    const body = CreateLeaveSchema.parse(bodyToValidate)

    const leave = await leaveService.createLeave(membershipId, body, user)

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'API:CREATE_LEAVE')
  }
}
