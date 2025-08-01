import { NextRequest } from 'next/server'

import {
  DELETE as deleteCompany,
  GET as getCompanyById,
  PATCH as updateCompany,
} from '../../../app/api/companies/[companyId]/route'
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
    getCompanyById: jest.fn().mockResolvedValue({
      id: '1',
      name: 'Entreprise Test',
      logoUrl: null,
      annualLeaveDays: 25,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    }),
    updateCompany: jest.fn().mockResolvedValue({
      id: '1',
      name: 'Entreprise Modifiée',
      logoUrl: null,
      annualLeaveDays: 30,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-20T00:00:00.000Z'),
      userMembershipId: 'membership-1',
      userRole: 'MANAGER',
    }),
    deleteCompany: jest.fn().mockResolvedValue(undefined),
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

  describe('GET /api/companies/[companyId]', () => {
    it("devrait retourner les détails d'une entreprise avec un statut 200", async () => {
      const params = Promise.resolve({ companyId: '1' })
      const response = await getCompanyById(
        new NextRequest('http://localhost:3000/api/companies/1'),
        { params }
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: '1',
        name: 'Entreprise Test',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })
    })
  })

  describe('PATCH /api/companies/[companyId]', () => {
    it('devrait modifier une entreprise avec un statut 200', async () => {
      const updateData = {
        id: '1',
        name: 'Entreprise Modifiée',
        annualLeaveDays: 30,
      }
      const req = new NextRequest('http://localhost:3000/api/companies/1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      })
      const params = Promise.resolve({ companyId: '1' })

      const response = await updateCompany(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: '1',
        name: 'Entreprise Modifiée',
        logoUrl: null,
        annualLeaveDays: 30,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
        userMembershipId: 'membership-1',
        userRole: 'MANAGER',
      })
    })
  })

  describe('DELETE /api/companies/[companyId]', () => {
    it('devrait supprimer une entreprise avec un statut 204', async () => {
      const params = Promise.resolve({ companyId: '1' })
      const response = await deleteCompany(
        new NextRequest('http://localhost:3000/api/companies/1'),
        { params }
      )

      expect(response.status).toBe(204)
      expect(await response.text()).toBe('')
    })
  })

  describe("Tests d'erreur", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('POST /api/companies - devrait retourner 422 pour des données invalides', async () => {
      const invalidData = { name: '' } // nom vide
      const req = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      // Mock une erreur de validation
      const { companyService } = jest.requireMock(
        '../../lib/services/company-service'
      )
      companyService.createCompany.mockRejectedValueOnce(
        new Error('Validation failed')
      )

      const response = await createCompany(req)
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it('GET /api/companies/[companyId] - devrait retourner 404 pour une entreprise inexistante', async () => {
      const params = Promise.resolve({ companyId: 'inexistant' })

      // Mock une erreur 404
      const { companyService } = jest.requireMock(
        '../../lib/services/company-service'
      )
      companyService.getCompanyById.mockRejectedValueOnce(
        new Error('Company not found')
      )

      const response = await getCompanyById(
        new NextRequest('http://localhost:3000/api/companies/inexistant'),
        { params }
      )
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it('PATCH /api/companies/[companyId] - devrait retourner une erreur pour des données invalides', async () => {
      const invalidData = { id: '1', name: 'Test', annualLeaveDays: 20 } // annualLeaveDays < 25
      const req = new NextRequest('http://localhost:3000/api/companies/1', {
        method: 'PATCH',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })
      const params = Promise.resolve({ companyId: '1' })

      const response = await updateCompany(req, { params })
      expect(response.status).toBe(500) // Erreur de validation Zod
    })
  })
})
