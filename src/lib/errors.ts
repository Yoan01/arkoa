import { NextResponse } from 'next/server'

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

const isDev = process.env.NODE_ENV !== 'production'

export function handleApiError(error: unknown, context = 'API') {
  let message = 'Une erreur est survenue.'
  let status = 500

  if (error instanceof ApiError) {
    message = error.message
    status = error.status
    console.error(`[${context}]`, error.message)
  } else if (error instanceof Error) {
    if (isDev) {
      message = error.message
    }
    console.error(`[${context}]`, error.message)
  } else {
    if (isDev) {
      message = String(error)
    }
    console.error(`[${context}] Erreur inconnue`, error)
  }

  return NextResponse.json({ error: message }, { status })
}
