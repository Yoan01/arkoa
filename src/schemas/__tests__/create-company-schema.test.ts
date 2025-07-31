import {
  CreateCompanyInput,
  CreateCompanySchema,
} from '../create-company-schema'

describe('CreateCompanySchema', () => {
  describe('valid inputs', () => {
    it('should validate a complete valid company object', () => {
      const validCompany: CreateCompanyInput = {
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(validCompany)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validCompany)
      }
    })

    it('should validate company without logoUrl', () => {
      const validCompany = {
        name: 'Test Company',
        annualLeaveDays: 30,
      }

      const result = CreateCompanySchema.safeParse(validCompany)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.logoUrl).toBeUndefined()
      }
    })

    it('should validate company with minimum annual leave days', () => {
      const validCompany = {
        name: 'Test Company',
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(validCompany)
      expect(result.success).toBe(true)
    })

    it('should validate company with more than minimum annual leave days', () => {
      const validCompany = {
        name: 'Test Company',
        annualLeaveDays: 35,
      }

      const result = CreateCompanySchema.safeParse(validCompany)
      expect(result.success).toBe(true)
    })

    it('should validate company with empty logoUrl', () => {
      const validCompany = {
        name: 'Test Company',
        logoUrl: '',
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(validCompany)
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject company without name', () => {
      const invalidCompany = {
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].path).toEqual(['name'])
        expect(result.error.issues[0].message).toBe('Required')
      }
    })

    it('should reject company with empty name', () => {
      const invalidCompany = {
        name: '',
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].path).toEqual(['name'])
        expect(result.error.issues[0].message).toBe('Le nom est requis')
      }
    })

    it('should reject company with whitespace-only name', () => {
      const invalidCompany = {
        name: '   ',
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le nom est requis')
      }
    })

    it('should reject company without annualLeaveDays', () => {
      const invalidCompany = {
        name: 'Test Company',
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].path).toEqual(['annualLeaveDays'])
        expect(result.error.issues[0].message).toBe('Required')
      }
    })

    it('should reject company with annualLeaveDays less than 25', () => {
      const invalidCompany = {
        name: 'Test Company',
        annualLeaveDays: 24,
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].path).toEqual(['annualLeaveDays'])
        expect(result.error.issues[0].message).toBe(
          'Le nombre de jours de congés doit être égale ou supérieur à 25'
        )
      }
    })

    it('should reject company with negative annualLeaveDays', () => {
      const invalidCompany = {
        name: 'Test Company',
        annualLeaveDays: -5,
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Le nombre de jours de congés doit être égale ou supérieur à 25'
        )
      }
    })

    it('should reject company with non-number annualLeaveDays', () => {
      const invalidCompany = {
        name: 'Test Company',
        annualLeaveDays: '25', // string instead of number
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['annualLeaveDays'])
        expect(result.error.issues[0].code).toBe('invalid_type')
      }
    })

    it('should reject company with non-string logoUrl', () => {
      const invalidCompany = {
        name: 'Test Company',
        logoUrl: 123, // number instead of string
        annualLeaveDays: 25,
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['logoUrl'])
        expect(result.error.issues[0].code).toBe('invalid_type')
      }
    })

    it('should reject company with extra fields', () => {
      const invalidCompany = {
        name: 'Test Company',
        annualLeaveDays: 25,
        extraField: 'should not be here',
      }

      const result = CreateCompanySchema.safeParse(invalidCompany)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('unrecognized_keys')
      }
    })
  })

  describe('edge cases', () => {
    it('should handle null input', () => {
      const result = CreateCompanySchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it('should handle undefined input', () => {
      const result = CreateCompanySchema.safeParse(undefined)
      expect(result.success).toBe(false)
    })

    it('should handle empty object', () => {
      const result = CreateCompanySchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2) // name and annualLeaveDays missing
      }
    })
  })
})
