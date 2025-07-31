import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveService } from '@/lib/services/leave-service'
import { getCalendarLeavesResponseSchema } from '@/schemas/queries/calendar-leaves-schema'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const queryParams = {
      companyId,
      year: year ? parseInt(year, 10) : undefined,
      month: month ? parseInt(month, 10) : undefined,
    }

    const leaves = await leaveService.getCalendarLeaves(
      companyId,
      user,
      queryParams
    )

    return NextResponse.json(getCalendarLeavesResponseSchema.parse(leaves), {
      status: 200,
    })
  } catch (error) {
    return handleApiError(error, 'API:GET_CALENDAR_LEAVES')
  }
}
