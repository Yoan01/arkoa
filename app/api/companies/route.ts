import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { companyService } from '@/lib/services/company-service'
import { CreateCompanySchema } from '@/schemas/create-company-schema'
import { UserCompaniesResponseSchema } from '@/schemas/queries/user-company-schema'

export async function GET() {
  try {
    const { user } = await requireAuth()

    const companies = await companyService.getCompaniesForUser(user)

    return NextResponse.json(UserCompaniesResponseSchema.parse(companies), {
      status: 200,
    })
  } catch (error) {
    return handleApiError(error, 'API:GET_COMPANIES')
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth()

    const json = await req.json()
    const body = CreateCompanySchema.parse(json)

    const newCompany = await companyService.createCompany(body, user)

    return NextResponse.json(newCompany, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'API:CREATE_COMPANY')
  }
}
