import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveBalanceService } from '@/lib/services/leave-balance-service'

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
