import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        memberships: {
          include: { user: true },
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // On pourrait aussi vérifier ici si l'utilisateur est MANAGER de cette company

    const body = await req.json()
    const { name } = body

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: { name },
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifie que l'utilisateur est MANAGER dans cette entreprise
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        companyId: params.id,
        role: 'MANAGER',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Accès refusé. Seul un manager peut supprimer l’entreprise.' },
        { status: 403 }
      )
    }

    await prisma.company.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
