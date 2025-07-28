import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { companyService } from '@/lib/services/company-service'
import { UserCompanySchema } from '@/schemas/queries/user-company-schema'
import { UpdateCompanySchema } from '@/schemas/update-company-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    const company = await companyService.getCompanyById(companyId, user)

    return NextResponse.json(company, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_COMPANY_DETAILS')
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()
    const json = await req.json()
    const body = UpdateCompanySchema.parse(json)

    const updatedCompany = await companyService.updateCompany(
      companyId,
      body,
      user
    )

    return NextResponse.json(UserCompanySchema.parse(updatedCompany), {
      status: 200,
    })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_COMPANY')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    await companyService.deleteCompany(companyId, user)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, 'API:DELETE_COMPANY')
  }
}
