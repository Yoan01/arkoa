import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth-server'
import { handleApiError } from '@/lib/errors'
import { membershipService } from '@/lib/services/membership-service'
import { InviteMemberSchema } from '@/schemas/invite-member-schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()

    const memberships = await membershipService.getMemberships(companyId, user)

    return NextResponse.json(memberships, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'API:GET_MEMBERSHIPS')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const { user } = await requireAuth()
    const json = await req.json()
    const body = InviteMemberSchema.parse(json)

    const newMembership = await membershipService.inviteMember(
      companyId,
      body,
      user
    )

    return NextResponse.json(newMembership, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'API:INVITE_MEMBER')
  }
}
