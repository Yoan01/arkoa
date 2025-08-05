/**
 * @jest-environment jsdom
 */
import { headers } from 'next/headers'

import { auth as betterAuth } from '@/lib/auth'

import { getAuth, getUser, requireAuth } from '../auth-server'

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))

const mockHeaders = headers as jest.MockedFunction<typeof headers>
const mockGetSession = betterAuth.api
  .getSession as unknown as jest.MockedFunction<
  (options: { headers: Headers }) => Promise<{
    session: {
      id: string
      token: string
      userId: string
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
      ipAddress?: string | null | undefined | undefined
      userAgent?: string | null | undefined | undefined
    } | null
    user: {
      id: string
      name: string
      emailVerified: boolean
      email: string
      createdAt: Date
      updatedAt: Date
      image?: string | null | undefined | undefined
    } | null
  } | null>
>

describe('auth-server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuth', () => {
    it('should call betterAuth.api.getSession with headers', async () => {
      const mockHeadersValue = new Headers({ authorization: 'Bearer token' })
      mockHeaders.mockResolvedValue(mockHeadersValue)

      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        },
        session: {
          id: 'session-1',
          token: 'mock-token',
          userId: '1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      }
      mockGetSession.mockResolvedValue(mockSession)

      const result = await getAuth()

      expect(mockHeaders).toHaveBeenCalledTimes(1)
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: mockHeadersValue,
      })
      expect(result).toEqual(mockSession)
    })

    it('should return null when no session exists', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)
      mockGetSession.mockResolvedValue(null)

      const result = await getAuth()

      expect(result).toBeNull()
    })

    it('should handle errors from getSession', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)
      mockGetSession.mockRejectedValue(new Error('Session error'))

      await expect(getAuth()).rejects.toThrow('Session error')
    })
  })

  describe('requireAuth', () => {
    it('should return auth when user is authenticated', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)

      const mockAuth = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        },
        session: {
          id: 'session-1',
          token: 'mock-token',
          userId: '1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      }
      mockGetSession.mockResolvedValue(mockAuth)

      const result = await requireAuth()

      expect(result).toEqual(mockAuth)
    })

    it('should throw error when user is not authenticated (null auth)', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)
      mockGetSession.mockResolvedValue(null)

      await expect(requireAuth()).rejects.toThrow('Utilisateur non authentifié')
    })

    it('should throw error when user is not authenticated (no user)', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)

      const mockAuth = {
        user: null,
        session: {
          id: 'session-1',
          token: 'mock-token',
          userId: '1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      }
      mockGetSession.mockResolvedValue(mockAuth)

      await expect(requireAuth()).rejects.toThrow('Utilisateur non authentifié')
    })
  })

  describe('getUser', () => {
    it('should return user data when authenticated', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)

      const mockAuth = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        },
        session: {
          id: 'session-1',
          token: 'mock-token',
          userId: '1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      }
      mockGetSession.mockResolvedValue(mockAuth)

      const result = await getUser()

      expect(result).toEqual({
        session: mockAuth.session,
        user: mockAuth.user,
        isAuthenticated: true,
      })
    })

    it('should return null values when not authenticated', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)
      mockGetSession.mockResolvedValue(null)

      const result = await getUser()

      expect(result).toEqual({
        session: null,
        user: null,
        isAuthenticated: false,
      })
    })

    it('should return null values when auth has no user', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)

      const mockAuth = {
        user: null,
        session: null,
      }
      mockGetSession.mockResolvedValue(mockAuth)

      const result = await getUser()

      expect(result).toEqual({
        session: null,
        user: null,
        isAuthenticated: false,
      })
    })

    it('should handle partial auth data', async () => {
      const mockHeadersValue = new Headers()
      mockHeaders.mockResolvedValue(mockHeadersValue)

      const mockAuth = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        },
        session: {
          id: 'session-1',
          token: 'mock-token',
          userId: '1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      }
      mockGetSession.mockResolvedValue(mockAuth)

      const result = await getUser()

      expect(result).toEqual({
        session: mockAuth.session,
        user: mockAuth.user,
        isAuthenticated: true,
      })
    })
  })
})
