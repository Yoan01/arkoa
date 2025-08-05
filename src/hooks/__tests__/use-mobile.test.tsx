/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'

import { useIsMobile } from '../use-mobile'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('useIsMobile', () => {
  let mockAddEventListener: jest.Mock
  let mockRemoveEventListener: jest.Mock
  let changeHandler: ((event: MediaQueryListEvent) => void) | null = null

  beforeEach(() => {
    mockAddEventListener = jest.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler
      }
    })
    mockRemoveEventListener = jest.fn()

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    changeHandler = null
  })

  it('should return false for desktop width (>= 768px)', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should return true for mobile width (< 768px)', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return true for tablet width (< 768px)', () => {
    // Set tablet width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for exactly 768px width', () => {
    // Set exactly breakpoint width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should update when window is resized', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // Trigger the change handler
      if (changeHandler) {
        changeHandler({} as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    expect(mockAddEventListener).toHaveBeenCalled()

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should handle edge case widths correctly', () => {
    const testCases = [
      { width: 0, expected: true },
      { width: 320, expected: true },
      { width: 480, expected: true },
      { width: 767, expected: true },
      { width: 768, expected: false },
      { width: 1024, expected: false },
      { width: 1920, expected: false },
    ]

    testCases.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      })

      const { result, unmount } = renderHook(() => useIsMobile())
      expect(result.current).toBe(expected)
      unmount()
    })
  })
})
