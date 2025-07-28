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

    const leaves = await leaveService.getCompanyLeaves(companyId, user)

    return NextResponse.json(leaves, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_COMPANY_LEAVES')
  }
}
