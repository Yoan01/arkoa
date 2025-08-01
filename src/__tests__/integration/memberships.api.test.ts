import { NextRequest } from 'next/server'

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
})
