import { NextRequest } from 'next/server'

import {
  GET as getCompanies,
  POST as createCompany,
} from '../../../app/api/companies/route'
// Using string literals instead of enums to avoid initialization issues

// Mock de l'authentification
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))

// Mock du service d'entreprises
jest.mock('../../lib/services/company-service', () => ({
  companyService: {
    getCompaniesForUser: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Entreprise Test',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        userMembershipId: 'membership-1',
        userRole: 'MANAGER',
      },
    ]),
    createCompany: jest.fn().mockResolvedValue({
      id: '2',
      name: 'Nouvelle Entreprise',
      logoUrl: null,
      annualLeaveDays: 25,
      createdAt: new Date('2024-01-15T00:00:00.000Z'),
      updatedAt: new Date('2024-01-15T00:00:00.000Z'),
    }),
  },
}))

describe("API Companies - Tests d'intégration", () => {
  describe('GET /api/companies', () => {
    it('devrait retourner la liste des entreprises avec un statut 200', async () => {
      const response = await getCompanies()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual([
        {
          id: '1',
          name: 'Entreprise Test',
          logoUrl: null,
          annualLeaveDays: 25,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          userMembershipId: 'membership-1',
          userRole: 'MANAGER',
        },
      ])
    })
  })

  describe('POST /api/companies', () => {
    it('devrait créer une nouvelle entreprise avec un statut 201', async () => {
      const companyData = { name: 'Nouvelle Entreprise', annualLeaveDays: 25 }
      const req = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(companyData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createCompany(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        id: '2',
        name: 'Nouvelle Entreprise',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      })
    })
  })
})
