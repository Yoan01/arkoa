import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveBalanceService } from '@/lib/services/leave-balance-service'
import { UpdateLeaveBalanceSchema } from '@/schemas/update-leave-balance-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  try {
    const { membershipId } = await params
    const { user } = await requireAuth()

    const balances = await leaveBalanceService.getLeaveBalances(
      membershipId,
      user
    )

    return NextResponse.json(balances, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_LEAVE_BALANCES')
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      companyId: string
      membershipId: string
    }>
  }
) {
  try {
    const { companyId, membershipId } = await params
    const { user } = await requireAuth()
    const body = UpdateLeaveBalanceSchema.parse(await req.json())

    const updatedBalance = await leaveBalanceService.updateLeaveBalance(
      companyId,
      membershipId,
      body,
      user
    )

    return NextResponse.json(updatedBalance, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_LEAVE_BALANCE')
  }
}
