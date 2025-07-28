import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { membershipService } from '@/lib/services/membership-service'
import { UpdateMembershipSchema } from '@/schemas/update-membership-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string; membershipId: string }> }
) {
  try {
    const { companyId, membershipId } = await params
    const { user } = await requireAuth()

    const membership = await membershipService.getMembershipById(
      companyId,
      membershipId,
      user
    )

    return NextResponse.json(membership, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_MEMBERSHIP')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; membershipId: string }> }
) {
  try {
    const { companyId, membershipId } = await params
    const { user } = await requireAuth()
    const body = UpdateMembershipSchema.parse(await req.json())

    const updated = await membershipService.updateMembership(
      companyId,
      membershipId,
      body,
      user
    )

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:UPDATE_MEMBERSHIP')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string; membershipId: string }> }
) {
  try {
    const { companyId, membershipId } = await params
    const { user } = await requireAuth()

    await membershipService.deleteMembership(companyId, membershipId, user)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, 'API:DELETE_MEMBERSHIP')
  }
}
