import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { membershipService } from '@/lib/services/membership-service'
import { UpdateLeaveBalancesSchema } from '@/schemas/update-leave-balances-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  try {
    const { membershipId } = await params
    const { user } = await requireAuth()

    const balances = await membershipService.getLeaveBalances(
      membershipId,
      user
    )

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
    const data = UpdateLeaveBalancesSchema.parse(await req.json())

    const results = await membershipService.updateLeaveBalances(
      companyId,
      membershipId,
      data,
      user
    )

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_LEAVE_BALANCES')
  }
}
