import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveService } from '@/lib/services/leave-service'
import { UpdateLeaveSchema } from '@/schemas/update-leave-schema'

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: { params: { companyId: string; membershipId: string; leaveId: string } }
) {
  try {
    const { companyId, membershipId, leaveId } = params
    const { user } = await requireAuth()
    const body = UpdateLeaveSchema.parse(await req.json())

    const updatedLeave = await leaveService.updateLeave(
      companyId,
      membershipId,
      leaveId,
      body,
      user
    )

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
    const { companyId, membershipId, leaveId } = params
    const { user } = await requireAuth()

    await leaveService.deleteLeave(companyId, membershipId, leaveId, user)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, 'API:DELETE_LEAVE')
  }
}
