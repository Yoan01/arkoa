import { CreateCompanySchema } from '../create-company-schema'

describe('createCompanySchema', () => {
  it('should validate a valid company creation input', () => {
    const validInput = {
      name: 'Test Company',
      annualLeaveDays: 25,
    }

    const result = CreateCompanySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('should validate company with logoUrl', () => {
    const validInput = {
      name: 'Test Company',
      logoUrl: 'https://example.com/logo.png',
      annualLeaveDays: 30,
    }

    const result = CreateCompanySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Company')
      expect(result.data.logoUrl).toBe('https://example.com/logo.png')
      expect(result.data.annualLeaveDays).toBe(30)
    }
  })

  it('should reject input without name', () => {
    const invalidInput = {
      annualLeaveDays: 25,
    }

    const result = CreateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name'])
    }
  })

  it('should reject empty name', () => {
    const invalidInput = {
      name: '',
      annualLeaveDays: 25,
    }

    const result = CreateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name'])
    }
  })

  it('should reject annualLeaveDays less than 25', () => {
    const invalidInput = {
      name: 'Valid Company',
      annualLeaveDays: 20,
    }

    const result = CreateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['annualLeaveDays'])
    }
  })

  it('should reject logoUrl that is not a string', () => {
    const input = {
      name: 'Valid Company',
      logoUrl: 123, // Non-string
      annualLeaveDays: 25,
    }
    const result = CreateCompanySchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['logoUrl'])
    }
  })

  it('should accept valid input without logoUrl', () => {
    const input = {
      name: 'Valid Company',
      annualLeaveDays: 25,
    }
    const result = CreateCompanySchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should accept valid input with logoUrl', () => {
    const input = {
      name: 'Valid Company',
      logoUrl: 'https://example.com/logo.png',
      annualLeaveDays: 25,
    }
    const result = CreateCompanySchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should reject extra fields', () => {
    const input = {
      name: 'Valid Company',
      logoUrl: 'https://example.com/logo.png',
      annualLeaveDays: 25,
      extraField: 'not allowed',
    }
    const result = CreateCompanySchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('unrecognized_keys')
    }
  })
})
