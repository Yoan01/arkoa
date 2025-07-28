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

    const events = await leaveService.getLeaveCalendar(companyId, user)

    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_LEAVE_CALENDAR')
  }
}
