import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { companyStatsService } from '@/lib/services/company-stats-service'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    const stats = await companyStatsService.getCompanyStats(companyId, user)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_COMPANY_STATS')
  }
}
