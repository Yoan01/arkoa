import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveService } from '@/lib/services/leave-service'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    const stats = await leaveService.getLeaveStats(companyId, user)

    return NextResponse.json(stats)
  } catch (error) {
    return handleApiError(error, 'API:GET_LEAVE_STATS')
  }
}
