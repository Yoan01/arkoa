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
  })
})
