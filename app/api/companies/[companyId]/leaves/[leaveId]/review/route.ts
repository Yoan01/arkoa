import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { leaveService } from '@/lib/services/leave-service'
import { ReviewLeaveSchema } from '@/schemas/review-leave-schema'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; leaveId: string }> }
) {
  try {
    const { companyId, leaveId } = await params
    const { user } = await requireAuth()
    const body = ReviewLeaveSchema.parse(await req.json())

    const reviewedLeave = await leaveService.reviewLeave(
      companyId,
      leaveId,
      body,
      user
    )

    return NextResponse.json(reviewedLeave, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:REVIEW_LEAVE')
  }
}
