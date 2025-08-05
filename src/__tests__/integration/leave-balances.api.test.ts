import { NextRequest } from 'next/server'

import { GET as getLeaveBalanceHistory } from '../../../app/api/companies/[companyId]/memberships/[membershipId]/leave-balance-history/route'
import {
  GET as getLeaveBalances,
  POST as updateLeaveBalance,
} from '../../../app/api/companies/[companyId]/memberships/[membershipId]/leave-balances/route'
import {
  DELETE as deleteMemberLeave,
  PATCH as updateMemberLeave,
} from '../../../app/api/companies/[companyId]/memberships/[membershipId]/leaves/[leaveId]/route'
import {
  GET as getMemberLeaves,
  POST as createMemberLeave,
} from '../../../app/api/companies/[companyId]/memberships/[membershipId]/leaves/route'

// Mock de l'authentification
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))

// Mock du service de soldes de congés
jest.mock('../../lib/services/leave-balance-service', () => ({
  leaveBalanceService: {
    getLeaveBalances: jest.fn().mockResolvedValue([
      {
        id: 'balance-1',
        membershipId: 'membership-1',
        leaveType: 'PAID',
        balance: 25,
        used: 5,
        remaining: 20,
        year: 2024,
      },
      {
        id: 'balance-2',
        membershipId: 'membership-1',
        leaveType: 'SICK',
        balance: 10,
        used: 2,
        remaining: 8,
        year: 2024,
      },
    ]),
    updateLeaveBalance: jest.fn().mockResolvedValue({
      id: 'balance-1',
      membershipId: 'membership-1',
      leaveType: 'PAID',
      balance: 30,
      used: 5,
      remaining: 25,
      year: 2024,
    }),
    getLeaveBalanceHistory: jest.fn().mockResolvedValue([
      {
        id: 'history-1',
        membershipId: 'membership-1',
        leaveType: 'PAID',
        previousBalance: 25,
        newBalance: 30,
        changeAmount: 5,
        reason: 'Annual adjustment',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin-user-id',
      },
      {
        id: 'history-2',
        membershipId: 'membership-1',
        leaveType: 'PAID',
        previousBalance: 30,
        newBalance: 27,
        changeAmount: -3,
        reason: 'Leave taken',
        createdAt: '2024-02-10T14:30:00Z',
        createdBy: 'system',
      },
    ]),
  },
}))

// Mock du service de congés
jest.mock('../../lib/services/leave-service', () => ({
  leaveService: {
    getLeavesForMembership: jest
      .fn()
      .mockImplementation((membershipId, _user) => {
        return Promise.resolve([
          {
            id: 'leave-1',
            membershipId: membershipId,
            type: 'PAID',
            status: 'APPROVED',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-01-17'),
            days: 3,
            reason: 'Vacation',
          },
          {
            id: 'leave-2',
            membershipId: membershipId,
            type: 'SICK',
            status: 'PENDING',
            startDate: new Date('2024-02-10'),
            endDate: new Date('2024-02-10'),
            days: 1,
            reason: 'Medical appointment',
          },
        ])
      }),
    createLeave: jest.fn().mockImplementation((membershipId, data, _user) => {
      return Promise.resolve({
        id: 'leave-3',
        membershipId: membershipId,
        type: data.type,
        status: 'PENDING',
        startDate: data.startDate,
        endDate: data.endDate,
        days: 3,
        reason: data.reason,
      })
    }),
    updateLeave: jest
      .fn()
      .mockImplementation((companyId, membershipId, leaveId, data, _user) => {
        return Promise.resolve({
          id: leaveId,
          startDate: data.startDate,
          endDate: data.endDate,
          type: data.type || 'PAID',
          status: 'PENDING',
          membershipId,
        })
      }),
    deleteLeave: jest.fn().mockResolvedValue(undefined),
  },
}))

describe("API Leave Balances et Member Leaves - Tests d'intégration", () => {
  describe('Leave Balances API', () => {
    it('GET /api/companies/[companyId]/memberships/[membershipId]/leave-balances - devrait retourner les soldes de congés', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leave-balances'
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      const response = await getLeaveBalances(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0]).toMatchObject({
        id: 'balance-1',
        membershipId: 'membership-1',
        leaveType: 'PAID',
        balance: 25,
        used: 5,
        remaining: 20,
        year: 2024,
      })
    })

    it('POST /api/companies/[companyId]/memberships/[membershipId]/leave-balances - devrait mettre à jour un solde de congés', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leave-balances',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'PAID',
            change: 5,
            reason: 'Annual adjustment',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      const response = await updateLeaveBalance(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'balance-1',
        membershipId: 'membership-1',
        leaveType: 'PAID',
        balance: 30,
        remaining: 25,
      })
    })

    it('POST /api/companies/[companyId]/memberships/[membershipId]/leave-balances - devrait retourner 500 pour des données invalides', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leave-balances',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'PAID',
            change: 0,
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      // Mock une erreur de validation
      const { leaveBalanceService } = jest.requireMock(
        '../../lib/services/leave-balance-service'
      )
      leaveBalanceService.updateLeaveBalance.mockRejectedValueOnce(
        new Error('Invalid leave type or negative balance')
      )

      const response = await updateLeaveBalance(req, { params })
      expect(response.status).toBe(500)
    })
  })

  describe('Leave Balance History API', () => {
    it("GET /api/companies/[companyId]/memberships/[membershipId]/leave-balance-history - devrait retourner l'historique des soldes", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leave-balance-history'
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      const response = await getLeaveBalanceHistory(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0]).toMatchObject({
        id: 'history-1',
        membershipId: 'membership-1',
        leaveType: 'PAID',
        previousBalance: 25,
        newBalance: 30,
        changeAmount: 5,
        reason: 'Annual adjustment',
      })
    })

    it('GET /api/companies/[companyId]/memberships/[membershipId]/leave-balance-history - devrait retourner un historique vide pour un nouveau membre', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/new-membership/leave-balance-history'
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'new-membership',
      })

      // Mock historique vide
      const { leaveBalanceService } = jest.requireMock(
        '../../lib/services/leave-balance-service'
      )
      leaveBalanceService.getLeaveBalanceHistory.mockResolvedValueOnce([])

      const response = await getLeaveBalanceHistory(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })
  })

  describe('Member Leaves API', () => {
    it("GET /api/companies/[companyId]/memberships/[membershipId]/leaves - devrait retourner les congés d'un membre", async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leaves'
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      const response = await getMemberLeaves(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0]).toMatchObject({
        id: 'leave-1',
        membershipId: 'membership-1',
        type: 'PAID',
        status: 'APPROVED',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-01-17T00:00:00.000Z',
        days: 3,
      })
    })

    it('POST /api/companies/[companyId]/memberships/[membershipId]/leaves - devrait créer un nouveau congé', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leaves',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'PAID',
            startDate: '2024-03-15',
            endDate: '2024-03-17',
            reason: 'Personal time',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      const response = await createMemberLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject({
        id: 'leave-3',
        membershipId: 'membership-1',
        type: 'PAID',
        status: 'PENDING',
        days: 3,
        reason: 'Personal time',
      })
      expect(data.startDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
      expect(data.endDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    })

    it('PATCH /api/companies/[companyId]/memberships/[membershipId]/leaves/[leaveId] - devrait mettre à jour un congé', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leaves/leave-1',
        {
          method: 'PATCH',
          body: JSON.stringify({
            type: 'PAID',
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-18T00:00:00.000Z',
            reason: 'Extended vacation',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
        leaveId: 'leave-1',
      })

      const response = await updateMemberLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'leave-1',
        status: 'PENDING',
        membershipId: 'membership-1',
      })
      expect(data.startDate).toBeDefined()
      expect(data.endDate).toBeDefined()
      expect(data.type).toBeDefined()
    })

    it('DELETE /api/companies/[companyId]/memberships/[membershipId]/leaves/[leaveId] - devrait supprimer un congé', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leaves/leave-1',
        { method: 'DELETE' }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
        leaveId: 'leave-1',
      })

      const response = await deleteMemberLeave(req, { params })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ success: true })
    })

    it('POST /api/companies/[companyId]/memberships/[membershipId]/leaves - devrait retourner 500 pour des données invalides', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leaves',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'PAID',
            startDate: '2024-13-40', // Date invalide
            endDate: '2024-01-15', // Date de fin avant date de début
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
      })

      // Mock une erreur de validation
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.createLeave.mockRejectedValueOnce(
        new Error('Invalid leave data')
      )

      const response = await createMemberLeave(req, { params })
      expect(response.status).toBe(500)
    })

    it('PATCH /api/companies/[companyId]/memberships/[membershipId]/leaves/[leaveId] - devrait retourner 500 pour un congé inexistant', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/memberships/membership-1/leaves/inexistant',
        {
          method: 'PATCH',
          body: JSON.stringify({
            reason: 'Updated reason',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        membershipId: 'membership-1',
        leaveId: 'inexistant',
      })

      // Mock une erreur 404
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.updateLeave.mockRejectedValueOnce(
        new Error('Leave not found')
      )

      const response = await updateMemberLeave(req, { params })
      expect(response.status).toBe(500)
    })
  })
})
