// app/api/user/route.ts
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// GET: Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: true,
        leaves: true,
        leaveBalances: true,
        managedLeaves: true,
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs.' },
      { status: 500 }
    )
  }
}
