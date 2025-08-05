/**
 * @jest-environment jsdom
 */
import { UserRole } from '@/generated/prisma'
import { ApiError } from '@/lib/errors'

import { leaveBalanceService } from '../leave-balance-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    leaveBalance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    leaveBalanceHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Get the mocked prisma instance after mocking
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require('@/lib/prisma')
const mockMembership = prisma.membership as jest.Mocked<
  typeof prisma.membership
>
const mockLeaveBalance = prisma.leaveBalance as jest.Mocked<
  typeof prisma.leaveBalance
>
const mockLeaveBalanceHistory = prisma.leaveBalanceHistory as jest.Mocked<
  typeof prisma.leaveBalanceHistory
>

describe('leaveBalanceService', () => {
  const mockUser = { id: 'user-1' }
  const mockMembershipData = {
    id: 'membership-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: UserRole.EMPLOYEE,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockManagerMembershipData = {
    id: 'membership-2',
    userId: 'user-1',
    companyId: 'company-1',
    role: UserRole.MANAGER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockLeaveBalanceData = {
    id: 'balance-1',
    membershipId: 'membership-1',
    type: 'PAID' as const,
    remainingDays: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLeaveBalances', () => {
    it('should return leave balances for own membership', async () => {
      mockMembership.findUnique.mockResolvedValue(mockMembershipData)
      mockMembership.findFirst.mockResolvedValue(mockMembershipData)
      mockLeaveBalance.findMany.mockResolvedValue([mockLeaveBalanceData])

      const result = await leaveBalanceService.getLeaveBalances(
        'membership-1',
        mockUser
      )

      expect(result).toEqual([mockLeaveBalanceData])
      expect(mockLeaveBalance.findMany).toHaveBeenCalledWith({
        where: { membershipId: 'membership-1' },
      })
    })

    it('should return leave balances for manager accessing employee data', async () => {
      mockMembership.findUnique.mockResolvedValue({
        ...mockMembershipData,
        userId: 'other-user',
      })
      mockMembership.findFirst.mockResolvedValue(mockManagerMembershipData)
      mockLeaveBalance.findMany.mockResolvedValue([mockLeaveBalanceData])

      const result = await leaveBalanceService.getLeaveBalances(
        'membership-1',
        mockUser
      )

      expect(result).toEqual([mockLeaveBalanceData])
    })

    it('should throw error when membership not found', async () => {
      mockMembership.findUnique.mockResolvedValue(null)

      await expect(
        leaveBalanceService.getLeaveBalances('membership-1', mockUser)
      ).rejects.toThrow(new ApiError('Membre non trouvé', 404))
    })

    it('should throw error when user has no access', async () => {
      mockMembership.findUnique.mockResolvedValue({
        ...mockMembershipData,
        userId: 'other-user',
      })
      mockMembership.findFirst.mockResolvedValue({
        ...mockMembershipData,
        role: UserRole.EMPLOYEE,
      })

      await expect(
        leaveBalanceService.getLeaveBalances('membership-1', mockUser)
      ).rejects.toThrow(new ApiError('Accès refusé', 403))
    })

    it('should throw error when requester membership not found', async () => {
      mockMembership.findUnique.mockResolvedValue(mockMembershipData)
      mockMembership.findFirst.mockResolvedValue(null)

      await expect(
        leaveBalanceService.getLeaveBalances('membership-1', mockUser)
      ).rejects.toThrow(new ApiError('Accès refusé', 403))
    })
  })

  describe('updateLeaveBalance', () => {
    const updateData = {
      type: 'PAID' as const,
      change: 5,
      reason: 'Annual allocation',
    }

    it('should update existing leave balance', async () => {
      mockMembership.findUnique
        .mockResolvedValueOnce(mockManagerMembershipData)
        .mockResolvedValueOnce(mockMembershipData)
      mockLeaveBalance.findUnique.mockResolvedValue(mockLeaveBalanceData)
      mockLeaveBalance.update.mockResolvedValue({
        ...mockLeaveBalanceData,
        remainingDays: 30,
      })
      mockLeaveBalanceHistory.create.mockResolvedValue({
        id: 'history-1',
        leaveBalanceId: 'balance-1',
        change: 5,
        reason: 'Annual allocation',
        actorId: 'user-1',
        createdAt: new Date(),
      })

      const result = await leaveBalanceService.updateLeaveBalance(
        'company-1',
        'membership-1',
        updateData,
        mockUser
      )

      expect(mockLeaveBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: { remainingDays: 30 },
      })
      expect(mockLeaveBalanceHistory.create).toHaveBeenCalledWith({
        data: {
          leaveBalanceId: 'balance-1',
          change: 5,
          reason: 'Annual allocation',
          actorId: 'user-1',
        },
      })
      expect(result.remainingDays).toBe(30)
    })

    it('should create new leave balance when none exists', async () => {
      mockMembership.findUnique
        .mockResolvedValueOnce(mockManagerMembershipData)
        .mockResolvedValueOnce(mockMembershipData)
      mockLeaveBalance.findUnique.mockResolvedValue(null)
      mockLeaveBalance.create.mockResolvedValue({
        ...mockLeaveBalanceData,
        remainingDays: 5,
      })
      mockLeaveBalanceHistory.create.mockResolvedValue({
        id: 'history-2',
        leaveBalanceId: 'balance-1',
        change: 5,
        reason: 'Annual allocation',
        actorId: 'user-1',
        createdAt: new Date(),
      })

      const result = await leaveBalanceService.updateLeaveBalance(
        'company-1',
        'membership-1',
        updateData,
        mockUser
      )

      expect(mockLeaveBalance.create).toHaveBeenCalledWith({
        data: {
          membershipId: 'membership-1',
          type: 'PAID',
          remainingDays: 5,
        },
      })
      expect(result.remainingDays).toBe(5)
    })

    it('should prevent negative balance when creating new balance', async () => {
      mockMembership.findUnique
        .mockResolvedValueOnce(mockManagerMembershipData)
        .mockResolvedValueOnce(mockMembershipData)
      mockLeaveBalance.findUnique.mockResolvedValue(null)
      mockLeaveBalance.create.mockResolvedValue({
        ...mockLeaveBalanceData,
        remainingDays: 0,
      })
      mockLeaveBalanceHistory.create.mockResolvedValue({
        id: 'history-3',
        leaveBalanceId: 'balance-1',
        change: -10,
        reason: 'Negative balance prevented',
        actorId: 'user-1',
        createdAt: new Date(),
      })

      const negativeUpdateData = { ...updateData, change: -10 }

      await leaveBalanceService.updateLeaveBalance(
        'company-1',
        'membership-1',
        negativeUpdateData,
        mockUser
      )

      expect(mockLeaveBalance.create).toHaveBeenCalledWith({
        data: {
          membershipId: 'membership-1',
          type: 'PAID',
          remainingDays: 0,
        },
      })
    })

    it('should throw error when user is not a manager', async () => {
      mockMembership.findUnique.mockResolvedValue({
        ...mockMembershipData,
        role: UserRole.EMPLOYEE,
      })

      await expect(
        leaveBalanceService.updateLeaveBalance(
          'company-1',
          'membership-1',
          updateData,
          mockUser
        )
      ).rejects.toThrow(
        new ApiError(
          'Accès refusé : seuls les managers peuvent modifier les soldes de congés',
          403
        )
      )
    })

    it('should throw error when requester membership not found', async () => {
      mockMembership.findUnique.mockResolvedValue(null)

      await expect(
        leaveBalanceService.updateLeaveBalance(
          'company-1',
          'membership-1',
          updateData,
          mockUser
        )
      ).rejects.toThrow(
        new ApiError(
          'Accès refusé : seuls les managers peuvent modifier les soldes de congés',
          403
        )
      )
    })

    it('should throw error when target membership not found', async () => {
      mockMembership.findUnique
        .mockResolvedValueOnce(mockManagerMembershipData)
        .mockResolvedValueOnce(null)

      await expect(
        leaveBalanceService.updateLeaveBalance(
          'company-1',
          'membership-1',
          updateData,
          mockUser
        )
      ).rejects.toThrow(
        new ApiError('Employé non trouvé dans cette entreprise', 404)
      )
    })

    it('should throw error when target membership belongs to different company', async () => {
      mockMembership.findUnique
        .mockResolvedValueOnce(mockManagerMembershipData)
        .mockResolvedValueOnce({
          ...mockMembershipData,
          companyId: 'other-company',
        })

      await expect(
        leaveBalanceService.updateLeaveBalance(
          'company-1',
          'membership-1',
          updateData,
          mockUser
        )
      ).rejects.toThrow(
        new ApiError('Employé non trouvé dans cette entreprise', 404)
      )
    })
  })

  describe('getLeaveBalanceHistory', () => {
    const mockHistory = [
      {
        id: 'history-1',
        leaveBalanceId: 'balance-1',
        change: 5,
        reason: 'Annual allocation',
        actorId: 'user-1',
        createdAt: new Date(),
        leaveBalance: { type: 'PAID' },
        actor: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      },
    ]

    it('should return leave balance history for own membership', async () => {
      mockMembership.findUnique.mockResolvedValue(mockMembershipData)
      mockMembership.findFirst.mockResolvedValue(mockMembershipData)
      mockLeaveBalanceHistory.findMany.mockResolvedValue(mockHistory)

      const result = await leaveBalanceService.getLeaveBalanceHistory(
        'membership-1',
        mockUser
      )

      expect(result).toEqual(mockHistory)
      expect(mockLeaveBalanceHistory.findMany).toHaveBeenCalledWith({
        where: { leaveBalance: { membershipId: 'membership-1' } },
        include: {
          leaveBalance: { select: { type: true } },
          actor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return history for manager accessing employee data', async () => {
      mockMembership.findUnique.mockResolvedValue({
        ...mockMembershipData,
        userId: 'other-user',
      })
      mockMembership.findFirst.mockResolvedValue(mockManagerMembershipData)
      mockLeaveBalanceHistory.findMany.mockResolvedValue(mockHistory)

      const result = await leaveBalanceService.getLeaveBalanceHistory(
        'membership-1',
        mockUser
      )

      expect(result).toEqual(mockHistory)
    })

    it('should throw error when membership not found', async () => {
      mockMembership.findUnique.mockResolvedValue(null)

      await expect(
        leaveBalanceService.getLeaveBalanceHistory('membership-1', mockUser)
      ).rejects.toThrow(new ApiError('Membre non trouvé', 404))
    })

    it('should throw error when user has no access', async () => {
      mockMembership.findUnique.mockResolvedValue({
        ...mockMembershipData,
        userId: 'other-user',
      })
      mockMembership.findFirst.mockResolvedValue({
        ...mockMembershipData,
        role: UserRole.EMPLOYEE,
      })

      await expect(
        leaveBalanceService.getLeaveBalanceHistory('membership-1', mockUser)
      ).rejects.toThrow(new ApiError('Accès refusé', 403))
    })
  })
})
