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

    const history = await leaveBalanceService.getLeaveBalanceHistory(
      membershipId,
      user
    )

    return NextResponse.json(history)
  } catch (error) {
    return handleApiError(error)
  }
}
