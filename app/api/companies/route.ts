import { NextRequest, NextResponse } from 'next/server'

import { UserRole } from '@/generated/prisma'
import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/schemas/create-company-schema'
import { UserCompaniesResponseSchema } from '@/schemas/queries/user-company-schema'

export async function GET() {
  try {
    const { user } = await requireAuth()

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        company: true,
      },
    })

    const companies = memberships.map(m => ({
      ...m.company,
      membershipId: m.id,
      isManager: m.role === UserRole.MANAGER,
    }))

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

    const company = await prisma.company.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        memberships: {
          create: {
            userId: user.id,
            role: 'MANAGER',
          },
        },
      },
      include: {
        memberships: {
          where: { userId: user.id },
        },
      },
    })

    const membership = company.memberships[0]

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { activeMembershipId: true },
    })

    if (!userRecord?.activeMembershipId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          activeMembershipId: membership.id,
        },
      })
    }

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'API:CREATE_COMPANY')
  }
}
