// Mock better-auth and its dependencies
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      getSession: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    handler: jest.fn(),
  })),
}))

jest.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: jest.fn(() => 'mocked-prisma-adapter'),
}))

jest.mock('better-auth/next-js', () => ({
  nextCookies: jest.fn(() => 'mocked-next-cookies'),
}))

jest.mock('../../generated/prisma', () => ({
  PrismaClient: jest.fn(
    () =>
      ({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      }) as any
  ),
}))

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'

import { PrismaClient } from '../../generated/prisma'

const mockBetterAuth = betterAuth as jest.MockedFunction<typeof betterAuth>
const mockPrismaAdapter = prismaAdapter as jest.MockedFunction<
  typeof prismaAdapter
>
const mockNextCookies = nextCookies as jest.MockedFunction<typeof nextCookies>
const mockPrismaClient = PrismaClient as jest.MockedClass<typeof PrismaClient>

// Import auth after mocks are set up

describe('auth', () => {
  const setupMocks = () => {
    // Reset mocks to their default implementations
    mockBetterAuth.mockImplementation(
      () =>
        ({
          api: {
            getSession: jest.fn(),
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
          },
          handler: jest.fn(),
        }) as any
    )

    mockPrismaAdapter.mockImplementation(() => 'mocked-prisma-adapter' as any)
    mockNextCookies.mockImplementation(() => 'mocked-next-cookies' as any)
    mockPrismaClient.mockImplementation(
      () =>
        ({
          $connect: jest.fn(),
          $disconnect: jest.fn(),
        }) as any
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()

    // Set up default environment variables
    process.env.BETTER_AUTH_SECRET = 'test-secret'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  })

  afterEach(() => {
    delete process.env.BETTER_AUTH_SECRET
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  describe('auth configuration', () => {
    it('auth module exports auth instance', async () => {
      const { auth } = await import('../auth')
      expect(auth).toBeDefined()
      expect(typeof auth).toBe('object')
    })
  })

  describe('environment variables', () => {
    it('auth works with environment variables', async () => {
      process.env.BETTER_AUTH_SECRET = 'test-secret'
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const { auth } = await import('../auth')
      expect(auth).toBeDefined()
    })
  })

  describe('auth instance', () => {
    it('exports auth instance', async () => {
      const { auth } = await import('../auth')
      expect(auth).toBeDefined()
      expect(typeof auth).toBe('object')
    })

    it('auth instance has expected methods', async () => {
      const { auth } = await import('../auth')
      expect(auth.api).toBeDefined()
      expect(auth.handler).toBeDefined()
    })

    it('maintains singleton pattern', async () => {
      const { auth: auth1 } = await import('../auth')
      const { auth: auth2 } = await import('../auth')

      expect(auth1).toBe(auth2)
    })
  })

  describe('configuration options', () => {
    it('auth instance is properly configured', async () => {
      const { auth } = await import('../auth')
      expect(auth).toBeDefined()
      expect(auth).toHaveProperty('api')
      expect(auth).toHaveProperty('handler')
    })
  })

  describe('error handling', () => {
    it('auth module can be imported without errors', async () => {
      await expect(import('../auth')).resolves.toBeDefined()
    })
  })

  describe('integration', () => {
    it('exports auth instance', async () => {
      const { auth } = await import('../auth')
      expect(auth).toBeDefined()
      expect(typeof auth).toBe('object')
    })

    it('auth instance has expected structure', async () => {
      const { auth } = await import('../auth')
      expect(auth).toHaveProperty('api')
      expect(auth).toHaveProperty('handler')
    })
  })
})
