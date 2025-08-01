import { NextRequest } from 'next/server'

import { GET as getCalendar } from '../../../app/api/companies/[companyId]/calendar/route'
import { GET as getLeaveStats } from '../../../app/api/companies/[companyId]/leaves/stats/route'

// Mock de l'authentification
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))

// Mock du service de congés
jest.mock('../../lib/services/leave-service', () => ({
  leaveService: {
    getCalendarLeaves: jest
      .fn()
      .mockImplementation((companyId, user, queryParams) => {
        if (queryParams?.year === 2025) {
          return Promise.resolve([])
        }
        return Promise.resolve([
          {
            id: 'leave-1',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-01-17'),
            type: 'PAID',
            status: 'APPROVED',
            halfDayPeriod: null,
            membership: {
              user: {
                id: 'user-1',
                name: 'John Doe',
              },
            },
          },
          {
            id: 'leave-2',
            startDate: new Date('2024-02-10'),
            endDate: new Date('2024-02-12'),
            type: 'SICK',
            status: 'PENDING',
            halfDayPeriod: null,
            membership: {
              user: {
                id: 'user-2',
                name: 'Jane Smith',
              },
            },
          },
        ])
      }),
    getLeaveStats: jest.fn().mockResolvedValue({
      totalLeaves: 25,
      approvedLeaves: 20,
      pendingLeaves: 3,
      rejectedLeaves: 2,
      leavesByType: {
        PAID: 15,
        SICK: 8,
        RTT: 2,
      },
      leavesByMonth: {
        '2024-01': 5,
        '2024-02': 8,
        '2024-03': 12,
      },
      averageLeaveDuration: 3.2,
      mostActiveMonth: '2024-03',
    }),
  },
}))

describe("API Calendar et Leave Stats - Tests d'intégration", () => {
  describe('Calendar API', () => {
    it('GET /api/companies/[companyId]/calendar - devrait retourner le calendrier des congés pour une année', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/calendar?year=2024'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getCalendar(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0]).toMatchObject({
        id: 'leave-1',
        type: 'PAID',
        status: 'APPROVED',
      })
      expect(data[0].membership.user).toMatchObject({
        id: 'user-1',
        name: 'John Doe',
      })
      expect(data[0].startDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
      expect(data[0].endDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    })

    it('GET /api/companies/[companyId]/calendar - devrait retourner un calendrier vide pour une année sans congés', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/calendar?year=2025'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      // Mock calendrier vide
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.getCalendarLeaves.mockResolvedValueOnce([])

      const response = await getCalendar(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it("GET /api/companies/[companyId]/calendar - devrait retourner 500 en cas d'erreur de base de données", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/calendar?year=2024'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      // Mock une erreur
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.getCalendarLeaves.mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const response = await getCalendar(req, { params })
      expect(response.status).toBe(500)
    })

    it('GET /api/companies/[companyId]/calendar - devrait gérer les paramètres de requête manquants', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/calendar'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getCalendar(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('Leave Stats API', () => {
    it('GET /api/companies/[companyId]/leaves/stats - devrait retourner les statistiques complètes des congés', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/stats'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      const response = await getLeaveStats(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        totalLeaves: 25,
        approvedLeaves: 20,
        pendingLeaves: 3,
        rejectedLeaves: 2,
        leavesByType: {
          PAID: 15,
          SICK: 8,
          RTT: 2,
        },
        leavesByMonth: {
          '2024-01': 5,
          '2024-02': 8,
          '2024-03': 12,
        },
        averageLeaveDuration: 3.2,
        mostActiveMonth: '2024-03',
      })
    })

    it('GET /api/companies/[companyId]/leaves/stats - devrait retourner des statistiques vides pour une entreprise sans congés', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/empty-company/leaves/stats'
      )
      const params = Promise.resolve({ companyId: 'empty-company' })

      // Mock statistiques vides
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.getLeaveStats.mockResolvedValueOnce({
        totalLeaves: 0,
        approvedLeaves: 0,
        pendingLeaves: 0,
        rejectedLeaves: 0,
        leavesByType: {},
        leavesByMonth: {},
        averageLeaveDuration: 0,
        mostActiveMonth: null,
      })

      const response = await getLeaveStats(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalLeaves).toBe(0)
      expect(data.approvedLeaves).toBe(0)
      expect(data.pendingLeaves).toBe(0)
      expect(data.rejectedLeaves).toBe(0)
      expect(data.mostActiveMonth).toBeNull()
    })

    it("GET /api/companies/[companyId]/leaves/stats - devrait retourner 500 en cas d'erreur de service", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/stats'
      )
      const params = Promise.resolve({ companyId: 'company-1' })

      // Mock une erreur
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.getLeaveStats.mockRejectedValueOnce(
        new Error('Service unavailable')
      )

      const response = await getLeaveStats(req, { params })
      expect(response.status).toBe(500)
    })

    it('GET /api/companies/[companyId]/leaves/stats - devrait retourner 500 pour une entreprise inexistante', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/inexistant/leaves/stats'
      )
      const params = Promise.resolve({ companyId: 'inexistant' })

      // Mock une erreur 404
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.getLeaveStats.mockRejectedValueOnce(
        new Error('Company not found')
      )

      const response = await getLeaveStats(req, { params })
      expect(response.status).toBe(500)
    })
  })
})
