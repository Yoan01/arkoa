import { cn } from '../utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'text-sm')
    expect(result).toBe('px-2 py-1 text-sm')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('should handle false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should resolve conflicts by keeping the last one
    const result = cn('px-2 px-4')
    expect(result).toBe('px-4')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['px-2', 'py-1'], 'text-sm')
    expect(result).toBe('px-2 py-1 text-sm')
  })

  it('should handle objects with boolean values', () => {
    const result = cn({
      'px-2': true,
      'py-1': true,
      'text-lg': false,
      'text-sm': true,
    })
    expect(result).toBe('px-2 py-1 text-sm')
  })

  it('should handle undefined and null values', () => {
    const result = cn('px-2', undefined, null, 'py-1')
    expect(result).toBe('px-2 py-1')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle complex Tailwind class conflicts', () => {
    // Test that twMerge properly handles Tailwind-specific conflicts
    const result = cn('bg-red-500 bg-blue-500 text-white text-black')
    expect(result).toBe('bg-blue-500 text-black')
  })

  it('should preserve non-conflicting classes', () => {
    const result = cn('px-2 bg-red-500', 'py-1 text-white', 'rounded')
    expect(result).toBe('px-2 bg-red-500 py-1 text-white rounded')
  })

  it('should handle responsive and state variants', () => {
    const result = cn('px-2 md:px-4', 'hover:bg-blue-500')
    expect(result).toBe('px-2 md:px-4 hover:bg-blue-500')
  })

  it('should handle mixed input types', () => {
    const result = cn(
      'base-class',
      ['array-class-1', 'array-class-2'],
      {
        'conditional-true': true,
        'conditional-false': false,
      },
      undefined,
      'final-class'
    )
    expect(result).toBe(
      'base-class array-class-1 array-class-2 conditional-true final-class'
    )
  })
})
