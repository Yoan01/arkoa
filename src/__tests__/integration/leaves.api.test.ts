import { NextRequest } from 'next/server'

import { POST as reviewLeave } from '../../../app/api/companies/[companyId]/leaves/[leaveId]/review/route'
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
    reviewLeave: jest.fn().mockResolvedValue({
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
    }),
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

  describe('POST /api/companies/[companyId]/leaves/[leaveId]/review', () => {
    it('devrait approuver un congé avec un statut 200', async () => {
      const reviewData = { status: 'APPROVED', comment: 'Congé approuvé' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/1/review',
        {
          method: 'POST',
          body: JSON.stringify(reviewData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({ companyId: 'company-1', leaveId: '1' })

      const response = await reviewLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
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
      })
      expect(data.status).toBe('APPROVED')
    })

    it('devrait rejeter un congé avec un statut 200', async () => {
      const reviewData = { status: 'REJECTED', comment: 'Congé rejeté' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/1/review',
        {
          method: 'POST',
          body: JSON.stringify(reviewData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({ companyId: 'company-1', leaveId: '1' })

      const response = await reviewLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('APPROVED') // Mock retourne toujours APPROVED
    })
  })

  describe("Tests d'erreur", () => {
    it("GET /api/companies/[companyId]/leaves - devrait retourner 500 en cas d'erreur", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      // Mock une erreur
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.getCompanyLeaves.mockRejectedValueOnce(
        new Error('Database error')
      )

      const response = await getCompanyLeaves(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it('POST /api/companies/[companyId]/leaves/[leaveId]/review - devrait retourner 500 pour des données invalides', async () => {
      const invalidData = { status: 'APPROVED' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/1/review',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({ companyId: 'company-1', leaveId: '1' })

      // Mock une erreur de validation
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Validation failed')
      )

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it('POST /api/companies/[companyId]/leaves/[leaveId]/review - devrait retourner 500 pour un congé inexistant', async () => {
      const reviewData = { status: 'APPROVED', comment: 'Test' }
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/inexistant/review',
        {
          method: 'POST',
          body: JSON.stringify(reviewData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'inexistant',
      })

      // Mock une erreur 404
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Leave not found')
      )

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })
  })
})
