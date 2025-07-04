import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { ApiError, handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { UserCompanySchema } from '@/schemas/queries/user-company-schema'
import { UpdateCompanySchema } from '@/schemas/update-company-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
      include: {
        company: true,
      },
    })

    if (!membership) {
      throw new ApiError('Entreprise non trouvée ou accès refusé', 403)
    }

    return NextResponse.json(membership.company, { status: 200 })
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

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
    })

    if (!membership || membership.role !== 'MANAGER') {
      throw new ApiError('Accès interdit', 403)
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { name: body.name, logoUrl: body.logoUrl },
    })

    const returnedCompany = {
      ...updatedCompany,
      userMembershipId: membership.id,
      userRole: membership.role,
    }

    return NextResponse.json(UserCompanySchema.parse(returnedCompany), {
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

    const membership = await prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
    })

    if (!membership || membership.role !== 'MANAGER') {
      throw new ApiError('Accès interdit', 403)
    }

    const membershipCount = await prisma.membership.count({
      where: {
        companyId,
      },
    })

    if (
      membershipCount > 1 ||
      (membershipCount === 1 && membership.role !== 'MANAGER')
    ) {
      throw new ApiError(
        "Impossible de supprimer l'entreprise : il ne doit rester qu'un manager pour supprimer l'entreprise",
        400
      )
    }

    await prisma.company.delete({
      where: { id: companyId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, 'API:DELETE_COMPANY')
  }
}
