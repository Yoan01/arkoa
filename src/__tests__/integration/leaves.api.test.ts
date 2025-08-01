import { NextRequest } from 'next/server'

import { GET as getCompanyLeaves } from '../../../app/api/companies/[companyId]/leaves/route'
// Using string literals instead of enums to avoid initialization issues

// Mock de l'authentification
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))

// Mock du service de congés
jest.mock('../../lib/services/leave-service', () => ({
  leaveService: {
    getCompanyLeaves: jest.fn().mockResolvedValue([
      {
        id: '1',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'APPROVED',
        type: 'PAID',
        halfDayPeriod: null,
        reason: "Vacances d'été",
        membership: {
          user: { name: 'John Doe', email: 'john@example.com' },
        },
      },
    ]),
  },
}))

describe("API Leaves - Tests d'intégration", () => {
  describe('GET /api/companies/[companyId]/leaves', () => {
    it('devrait retourner la liste des congés avec un statut 200', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getCompanyLeaves(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual([
        {
          id: '1',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          status: 'APPROVED',
          type: 'PAID',
          halfDayPeriod: null,
          reason: "Vacances d'été",
          membership: {
            user: { name: 'John Doe', email: 'john@example.com' },
          },
        },
      ])
    })

    it('devrait filtrer les congés par statut', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves?status=PENDING'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getCompanyLeaves(req, { params })

      expect(response.status).toBe(200)
    })
  })
})
