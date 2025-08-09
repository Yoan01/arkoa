import { UpdateCompanySchema } from '../update-company-schema'

describe('UpdateCompanySchema', () => {
  it('should validate a valid company update with all fields', () => {
    const validInput = {
      id: 'company-123',
      name: 'Updated Company Name',
      logoUrl: 'https://example.com/logo.png',
      annualLeaveDays: 25,
    }

    const result = UpdateCompanySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('should validate a valid company update with required fields only', () => {
    const validInput = {
      id: 'company-123',
      name: 'Updated Company Name',
      annualLeaveDays: 30,
    }

    const result = UpdateCompanySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('should validate with optional logoUrl', () => {
    const validInput = {
      id: 'company-123',
      name: 'Updated Company Name',
      annualLeaveDays: 25,
    }

    const result = UpdateCompanySchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('should reject missing id', () => {
    const invalidInput = {
      name: 'Company Name',
      annualLeaveDays: 25,
    }

    const result = UpdateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['id'])
    }
  })

  it('should reject empty id', () => {
    const invalidInput = {
      id: '',
      name: 'Company Name',
      annualLeaveDays: 25,
    }

    const result = UpdateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['id'])
    }
  })

  it('should reject empty name', () => {
    const invalidInput = {
      id: 'company-123',
      name: '',
      annualLeaveDays: 25,
    }

    const result = UpdateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name'])
    }
  })

  it('should reject annualLeaveDays below 25', () => {
    const invalidInput = {
      id: 'company-123',
      name: 'Company Name',
      annualLeaveDays: 20,
    }

    const result = UpdateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['annualLeaveDays'])
    }
  })

  it('should reject non-string id', () => {
    const invalidInput = {
      id: 123,
      name: 'Company Name',
      annualLeaveDays: 25,
    }

    const result = UpdateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['id'])
    }
  })

  it('should reject non-number annualLeaveDays', () => {
    const invalidInput = {
      id: 'company-123',
      name: 'Company Name',
      annualLeaveDays: 'twenty-five',
    }

    const result = UpdateCompanySchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['annualLeaveDays'])
    }
  })
})
