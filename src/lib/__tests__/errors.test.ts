/**
 * @jest-environment jsdom
 */
import { NextResponse } from 'next/server'

import { ApiError, handleApiError } from '../errors'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

// Mock console.error to avoid noise in tests
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {})

const mockNextResponseJson = NextResponse.json as jest.MockedFunction<
  typeof NextResponse.json
>

describe('errors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockConsoleError.mockClear()
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
  })

  describe('ApiError', () => {
    it('should create an ApiError with default status 500', () => {
      const error = new ApiError('Test error message')

      expect(error.message).toBe('Test error message')
      expect(error.status).toBe(500)
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
    })

    it('should create an ApiError with custom status', () => {
      const error = new ApiError('Not found', 404)

      expect(error.message).toBe('Not found')
      expect(error.status).toBe(404)
      expect(error.name).toBe('ApiError')
    })

    it('should create an ApiError with different status codes', () => {
      const testCases = [
        { message: 'Bad request', status: 400 },
        { message: 'Unauthorized', status: 401 },
        { message: 'Forbidden', status: 403 },
        { message: 'Not found', status: 404 },
        { message: 'Conflict', status: 409 },
        { message: 'Internal server error', status: 500 },
      ]

      testCases.forEach(({ message, status }) => {
        const error = new ApiError(message, status)
        expect(error.message).toBe(message)
        expect(error.status).toBe(status)
      })
    })
  })

  describe('handleApiError', () => {
    beforeEach(() => {
      mockNextResponseJson.mockReturnValue({
        status: 500,
        json: async () => ({ error: 'Mock response' }),
      } as NextResponse)
    })

    describe('with ApiError', () => {
      it('should handle ApiError correctly', () => {
        const apiError = new ApiError('Custom API error', 400)

        handleApiError(apiError, 'TEST_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[TEST_CONTEXT]',
          'Custom API error'
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'Custom API error' },
          { status: 400 }
        )
      })

      it('should use default context when not provided', () => {
        const apiError = new ApiError('API error', 404)

        handleApiError(apiError)

        expect(mockConsoleError).toHaveBeenCalledWith('[API]', 'API error')
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'API error' },
          { status: 404 }
        )
      })
    })

    describe('with regular Error', () => {
      it('should handle regular Error in test/development mode', () => {
        // In test environment, isDev is true (NODE_ENV !== 'production')
        const error = new Error('Regular error message')

        handleApiError(error, 'DEV_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[DEV_CONTEXT]',
          'Regular error message'
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'Regular error message' },
          { status: 500 }
        )
      })
    })

    describe('with unknown error types', () => {
      it('should handle string error in test/development mode', () => {
        // In test environment, isDev is true (NODE_ENV !== 'production')
        const error = 'String error message'

        handleApiError(error, 'STRING_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[STRING_CONTEXT] Erreur inconnue',
          'String error message'
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'String error message' },
          { status: 500 }
        )
      })

      it('should handle number error in test/development mode', () => {
        const error = 42

        handleApiError(error, 'NUMBER_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[NUMBER_CONTEXT] Erreur inconnue',
          42
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: '42' },
          { status: 500 }
        )
      })

      it('should handle null error', () => {
        const error = null

        handleApiError(error, 'NULL_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[NULL_CONTEXT] Erreur inconnue',
          null
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'null' },
          { status: 500 }
        )
      })

      it('should handle undefined error', () => {
        const error = undefined

        handleApiError(error, 'UNDEFINED_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[UNDEFINED_CONTEXT] Erreur inconnue',
          undefined
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'undefined' },
          { status: 500 }
        )
      })

      it('should handle object error', () => {
        const error: Record<string, unknown> = {
          code: 'CUSTOM_ERROR',
          details: 'Something went wrong',
        }

        handleApiError(error, 'OBJECT_CONTEXT')

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[OBJECT_CONTEXT] Erreur inconnue',
          error
        )
        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: '[object Object]' },
          { status: 500 }
        )
      })
    })

    describe('environment-specific behavior', () => {
      it('should show error messages in test/development environment', () => {
        // In test environment, isDev is true, so error messages are shown
        const error = new Error('Detailed error message')

        handleApiError(error)

        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'Detailed error message' },
          { status: 500 }
        )
      })

      it('should always show ApiError messages regardless of environment', () => {
        const apiError = new ApiError('API error message', 400)

        handleApiError(apiError)

        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { error: 'API error message' },
          { status: 400 }
        )
      })

      it('should verify isDev logic works correctly', () => {
        // Test that we're actually in a development-like environment
        expect(process.env.NODE_ENV).not.toBe('production')
      })
    })
  })
})
