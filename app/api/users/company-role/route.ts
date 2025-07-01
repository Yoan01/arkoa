import { NextRequest, NextResponse } from 'next/server'

import { UserRole } from '@/generated/prisma'
import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { UserCompanyRoleSchema } from '@/schemas/queries/company-role-schema'

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth()
    const companyId = req.nextUrl.searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        companyId,
      },
    })

    const response = {
      role: membership?.role,
      isManager: membership?.role === UserRole.MANAGER,
    }

    return NextResponse.json(UserCompanyRoleSchema.parse(response), {
      status: 200,
    })
  } catch (error) {
    return handleApiError(error, 'API:GET_USER_COMPANY_ROLE')
  }
}
