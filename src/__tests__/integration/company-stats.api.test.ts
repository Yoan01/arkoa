import { NextRequest } from 'next/server'

// Using string literals instead of enums to avoid initialization issues
import { GET as getCompanyStats } from '../../../app/api/companies/[companyId]/stats/route'

// Mock de l'authentification
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))

// Mock du service de stats
jest.mock('../../lib/services/company-stats-service', () => ({
  companyStatsService: {
    getCompanyStats: jest.fn().mockResolvedValue({
      totalEmployees: 10,
      activeLeaves: 2,
      pendingApprovals: 1,
      totalLeavesTaken: 5,
      leavesByType: {
        PAID: 3,
        SICK: 1,
        RTT: 1,
      },
      leavesByStatus: {
        APPROVED: 4,
        PENDING: 1,
      },
    }),
  },
}))

describe("API Company Stats - Tests d'intégration", () => {
  describe('GET /api/companies/[companyId]/stats', () => {
    it("devrait retourner les statistiques de l'entreprise avec un statut 200", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/stats'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getCompanyStats(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        totalEmployees: 10,
        activeLeaves: 2,
        pendingApprovals: 1,
        totalLeavesTaken: 5,
        leavesByType: {
          PAID: 3,
          SICK: 1,
          RTT: 1,
        },
        leavesByStatus: {
          APPROVED: 4,
          PENDING: 1,
        },
      })
      expect(data.leavesByType.PAID).toBe(3)
      expect(data.leavesByType.SICK).toBe(1)
      expect(data.leavesByType.RTT).toBe(1)
      expect(data.leavesByStatus.APPROVED).toBe(4)
      expect(data.leavesByStatus.PENDING).toBe(1)
    })

    it('devrait retourner des statistiques vides pour une entreprise sans données', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/empty-company/stats'
      )
      const params = Promise.resolve({ companyId: 'empty-company' })

      // Mock des statistiques vides
      const { companyStatsService } = jest.requireMock(
        '../../lib/services/company-stats-service'
      )
      companyStatsService.getCompanyStats.mockResolvedValueOnce({
        totalEmployees: 0,
        activeLeaves: 0,
        pendingApprovals: 0,
        totalLeavesTaken: 0,
        leavesByType: {},
        leavesByStatus: {},
      })

      const response = await getCompanyStats(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalEmployees).toBe(0)
      expect(data.activeLeaves).toBe(0)
      expect(data.pendingApprovals).toBe(0)
      expect(data.totalLeavesTaken).toBe(0)
    })
  })

  describe("Tests d'erreur", () => {
    it("GET /api/companies/[companyId]/stats - devrait retourner 500 en cas d'erreur de base de données", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/stats'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      // Mock une erreur de base de données
      const { companyStatsService } = jest.requireMock(
        '../../lib/services/company-stats-service'
      )
      companyStatsService.getCompanyStats.mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const response = await getCompanyStats(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it('GET /api/companies/[companyId]/stats - devrait retourner 500 pour une entreprise inexistante', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/inexistant/stats'
      )
      const params = Promise.resolve({ companyId: 'inexistant' })

      // Mock une erreur 404
      const { companyStatsService } = jest.requireMock(
        '../../lib/services/company-stats-service'
      )
      companyStatsService.getCompanyStats.mockRejectedValueOnce(
        new Error('Company not found')
      )

      const response = await getCompanyStats(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })

    it("GET /api/companies/[companyId]/stats - devrait retourner 500 en cas d'erreur d'autorisation", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/unauthorized/stats'
      )
      const params = Promise.resolve({ companyId: 'unauthorized' })

      // Mock une erreur d'autorisation
      const { companyStatsService } = jest.requireMock(
        '../../lib/services/company-stats-service'
      )
      companyStatsService.getCompanyStats.mockRejectedValueOnce(
        new Error('Unauthorized access')
      )

      const response = await getCompanyStats(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
    })
  })
})
