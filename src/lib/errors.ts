import { NextResponse } from 'next/server'

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown, context = 'API') {
  if (error instanceof ApiError) {
    console.error(`[${context}]`, error.message)
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  if (error instanceof Error) {
    console.error(`[${context}]`, error.message)
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    )
  }

  console.error(`[${context}] Erreur inconnue`, error)
  return NextResponse.json(
    { error: 'Erreur serveur inconnue.' },
    { status: 500 }
  )
}
