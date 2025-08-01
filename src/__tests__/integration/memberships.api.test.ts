import { NextRequest } from 'next/server'

import {
  DELETE as deleteMembership,
  GET as getMembershipById,
  POST as updateMembership,
} from '../../../app/api/companies/[companyId]/memberships/[membershipId]/route'
import {
  GET as getMemberships,
  POST as inviteMember,
} from '../../../app/api/companies/[companyId]/memberships/route'
// Using string literals instead of enums to avoid initialization issues

// Mock de l'authentification
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))

// Mock du service de memberships
jest.mock('../../lib/services/membership-service', () => ({
  membershipService: {
    getMemberships: jest.fn().mockResolvedValue([
      {
        id: '1',
        role: 'MANAGER',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        user: { name: 'John Doe', email: 'john@example.com' },
      },
    ]),
    inviteMember: jest.fn().mockResolvedValue({
      id: '2',
      role: 'EMPLOYEE',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      user: { name: 'Jane Smith', email: 'jane@example.com' },
    }),
    getMembershipById: jest.fn().mockResolvedValue({
      id: '1',
      role: 'MANAGER',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      user: { name: 'John Doe', email: 'john@example.com' },
    }),
    updateMembership: jest.fn().mockResolvedValue({
      id: '1',
      role: 'EMPLOYEE',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z',
      user: { name: 'John Doe', email: 'john@example.com' },
    }),
    deleteMembership: jest.fn().mockResolvedValue(undefined),
  },
}))

describe("API Memberships - Tests d'intégration", () => {
  describe('GET /api/companies/[companyId]/memberships', () => {
    it('devrait retourner la liste des membres avec un statut 200', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getMemberships(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual([
        {
          id: '1',
          role: 'MANAGER',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          user: { name: 'John Doe', email: 'john@example.com' },
        },
      ])
    })
  })

  describe('POST /api/companies/[companyId]/memberships', () => {
    it('devrait inviter un nouveau membre avec un statut 201', async () => {
      const memberData = { email: 'jane@example.com', role: 'EMPLOYEE' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships',
        {
          method: 'POST',
          body: JSON.stringify(memberData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await inviteMember(req, { params })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        id: '2',
        role: 'EMPLOYEE',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
        user: { name: 'Jane Smith', email: 'jane@example.com' },
      })
      expect(data.role).toBe('EMPLOYEE')
    })
  })

  describe('GET /api/companies/[companyId]/memberships/[membershipId]', () => {
    it("devrait retourner les détails d'un membre avec un statut 200", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/1'
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: '1',
      })

      const response = await getMembershipById(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: '1',
        role: 'MANAGER',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        user: { name: 'John Doe', email: 'john@example.com' },
      })
    })
  })

  describe('POST /api/companies/[companyId]/memberships/[membershipId]', () => {
    it('devrait mettre à jour un membre avec un statut 200', async () => {
      const updateData = { role: 'EMPLOYEE' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/1',
        {
          method: 'POST',
          body: JSON.stringify(updateData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: '1',
      })

      const response = await updateMembership(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: '1',
        role: 'EMPLOYEE',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
        user: { name: 'John Doe', email: 'john@example.com' },
      })
      expect(data.role).toBe('EMPLOYEE')
    })
  })

  describe('DELETE /api/companies/[companyId]/memberships/[membershipId]', () => {
    it('devrait supprimer un membre avec un statut 204', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/1',
        { method: 'DELETE' }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: '1',
      })

      const response = await deleteMembership(req, { params })

      expect(response.status).toBe(204)
    })
  })

  describe("Tests d'erreur", () => {
    it('POST /api/companies/[companyId]/memberships - devrait retourner 500 pour des données invalides', async () => {
      const invalidData = { email: 'invalid-email', role: 'EMPLOYEE' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      // Mock une erreur de validation
      const { membershipService } = jest.requireMock(
        '../../lib/services/membership-service'
      )
      membershipService.inviteMember.mockRejectedValueOnce(
        new Error('Validation failed')
      )

      const response = await inviteMember(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it('GET /api/companies/[companyId]/memberships/[membershipId] - devrait retourner 500 pour un membre inexistant', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/inexistant'
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'inexistant',
      })

      // Mock une erreur 404
      const { membershipService } = jest.requireMock(
        '../../lib/services/membership-service'
      )
      membershipService.getMembershipById.mockRejectedValueOnce(
        new Error('Membership not found')
      )

      const response = await getMembershipById(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })
  })
})
