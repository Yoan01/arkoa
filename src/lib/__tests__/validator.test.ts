import { passwordConstraint } from '../validator'

describe('validator', () => {
  describe('passwordConstraint', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password123!',
        'MySecure@Pass1',
        'Complex#Password9',
        'Strong$Pass123',
        'Valid&Password1',
      ]

      validPasswords.forEach(password => {
        expect(() => passwordConstraint.parse(password)).not.toThrow()
      })
    })

    it('should reject passwords without lowercase letters', () => {
      const invalidPassword = 'PASSWORD123!'
      expect(() => passwordConstraint.parse(invalidPassword)).toThrow(
        'Votre mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial'
      )
    })

    it('should reject passwords without uppercase letters', () => {
      const invalidPassword = 'password123!'
      expect(() => passwordConstraint.parse(invalidPassword)).toThrow(
        'Votre mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial'
      )
    })

    it('should reject passwords without numbers', () => {
      const invalidPassword = 'Password!'
      expect(() => passwordConstraint.parse(invalidPassword)).toThrow(
        'Votre mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial'
      )
    })

    it('should reject passwords without special characters', () => {
      const invalidPassword = 'Password123'
      expect(() => passwordConstraint.parse(invalidPassword)).toThrow(
        'Votre mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial'
      )
    })

    it('should reject passwords shorter than 8 characters', () => {
      const invalidPassword = 'Pass1!'
      expect(() => passwordConstraint.parse(invalidPassword)).toThrow(
        'Votre mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial'
      )
    })

    it('should reject non-string values', () => {
      const invalidValues = [123, null, undefined, {}, []]

      invalidValues.forEach(value => {
        expect(() => passwordConstraint.parse(value)).toThrow()
      })
    })
  })
})
