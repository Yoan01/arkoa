// app/api/company/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Récupérer toutes les entreprises
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises.' },
      { status: 500 }
    )
  }
}

// POST: Créer une nouvelle entreprise
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est requis." },
        { status: 400 }
      )
    }

    const newCompany = await prisma.company.create({
      data: {
        name,
        memberships: {
          create: {
            userId,
            role: 'MANAGER',
          },
        },
      },
      include: {
        memberships: true,
      },
    })

    return NextResponse.json(newCompany, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création de l’entreprise.' },
      { status: 500 }
    )
  }
}
