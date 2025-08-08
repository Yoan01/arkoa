import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()
export const auth = betterAuth({
  trustedOrigins: [
    'http://192.168.0.30:3000',
    'http://localhost:3000',
    'https://arkoa.app',
    'https://www.arkoa.app',
    'https://staging.arkoa.app',
    'https://www.staging.arkoa.app',
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
    },
  },
})
