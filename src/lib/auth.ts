import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()
export const auth = betterAuth({
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
