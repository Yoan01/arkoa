import { User } from 'better-auth'

import { UserRole } from '@/generated/prisma'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

import { companyStatsService } from '../company-stats-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    leave: {
      count: jest.fn(),
    },
    leaveBalance: {
      findMany: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('companyStatsService', () => {
  const mockUser: Pick<User, 'id'> = { id: 'user-1' }
  const mockManagerMembership = {
    id: 'membership-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: UserRole.MANAGER,
  }
  const mockEmployeeMembership = {
    id: 'membership-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: UserRole.EMPLOYEE,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock for leaveBalance.findMany
    ;(prisma.leaveBalance.findMany as jest.Mock).mockResolvedValue([])
  })

  describe('getCompanyStats', () => {
    it('should return company stats for manager', async () => {
      const expectedStats = {
        totalEmployees: 10,
        employeesOnLeave: 2,
        pendingRequests: 3,
        averageLeaveBalance: 20,
      }

      const mockLeaveBalances = [
        { remainingDays: 20 },
        { remainingDays: 15 },
        { remainingDays: 25 },
      ]

      ;(mockPrisma.membership.findUnique as jest.Mock).mockResolvedValue(
        mockManagerMembership
      )
      ;(mockPrisma.membership.count as jest.Mock).mockResolvedValue(10) // totalEmployees
      ;(mockPrisma.leave.count as jest.Mock)
        .mockResolvedValueOnce(2) // employeesOnLeave
        .mockResolvedValueOnce(3) // pendingRequests
      ;(mockPrisma.leaveBalance.findMany as jest.Mock).mockResolvedValue(
        mockLeaveBalances
      )

      const result = await companyStatsService.getCompanyStats(
        'company-1',
        mockUser
      )

      expect(result).toEqual(expectedStats)

      // Verify membership check
      expect(mockPrisma.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: 'user-1',
            companyId: 'company-1',
          },
        },
      })

      // Verify total employees count
      expect(mockPrisma.membership.count).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
        },
      })

      // Verify leave counts
      expect(mockPrisma.leave.count).toHaveBeenCalledTimes(2)

      // Check employees on leave query
      expect(mockPrisma.leave.count).toHaveBeenNthCalledWith(1, {
        where: {
          membership: {
            companyId: 'company-1',
          },
          status: 'APPROVED',
          startDate: {
            lte: expect.any(Date),
          },
          endDate: {
            gte: expect.any(Date),
          },
        },
      })

      // Check pending requests query
      expect(mockPrisma.leave.count).toHaveBeenNthCalledWith(2, {
        where: {
          membership: {
            companyId: 'company-1',
          },
          status: 'PENDING',
        },
      })

      // Verify leave balance query
      expect(mockPrisma.leaveBalance.findMany).toHaveBeenCalledWith({
        where: {
          membership: {
            companyId: 'company-1',
          },
          type: 'PAID',
        },
      })
    })

    it('should throw error for non-manager user', async () => {
      ;(mockPrisma.membership.findUnique as jest.Mock).mockResolvedValue(
        mockEmployeeMembership
      )

      await expect(
        companyStatsService.getCompanyStats('company-1', mockUser)
      ).rejects.toThrow(ApiError)

      await expect(
        companyStatsService.getCompanyStats('company-1', mockUser)
      ).rejects.toThrow(
        'Accès refusé : seuls les managers peuvent voir les statistiques'
      )
    })

    it('should throw error for non-existent membership', async () => {
      ;(mockPrisma.membership.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(
        companyStatsService.getCompanyStats('company-1', mockUser)
      ).rejects.toThrow(ApiError)

      await expect(
        companyStatsService.getCompanyStats('company-1', mockUser)
      ).rejects.toThrow(
        'Accès refusé : seuls les managers peuvent voir les statistiques'
      )
    })

    it('should handle zero stats correctly', async () => {
      const expectedStats = {
        totalEmployees: 0,
        employeesOnLeave: 0,
        pendingRequests: 0,
        averageLeaveBalance: 0,
      }

      ;(mockPrisma.membership.findUnique as jest.Mock).mockResolvedValue(
        mockManagerMembership
      )
      ;(mockPrisma.membership.count as jest.Mock).mockResolvedValue(0)
      ;(mockPrisma.leave.count as jest.Mock).mockResolvedValue(0)
      ;(mockPrisma.leaveBalance.findMany as jest.Mock).mockResolvedValue([])

      const result = await companyStatsService.getCompanyStats(
        'company-1',
        mockUser
      )

      expect(result).toEqual(expectedStats)
    })

    it('should handle large numbers correctly', async () => {
      const mockLeaveBalances = Array.from({ length: 1000 }, (_, i) => ({
        remainingDays: 20 + (i % 10), // Varying between 20-29
      }))

      const expectedStats = {
        totalEmployees: 1000,
        employeesOnLeave: 50,
        pendingRequests: 25,
        averageLeaveBalance: 24.5, // Average of 20-29
      }

      ;(mockPrisma.membership.findUnique as jest.Mock).mockResolvedValue(
        mockManagerMembership
      )
      ;(mockPrisma.membership.count as jest.Mock).mockResolvedValue(1000)
      ;(mockPrisma.leave.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(25)
      ;(mockPrisma.leaveBalance.findMany as jest.Mock).mockResolvedValue(
        mockLeaveBalances
      )

      const result = await companyStatsService.getCompanyStats(
        'company-1',
        mockUser
      )

      expect(result).toEqual(expectedStats)
    })

    it('should use current date for employees on leave calculation', async () => {
      const mockMembership = {
        id: 'membership-1',
        role: UserRole.MANAGER,
        companyId: 'company-1',
      }

      const mockDate = new Date('2023-12-15')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
      ;(prisma.membership.findUnique as jest.Mock).mockResolvedValue(
        mockMembership
      )
      ;(prisma.membership.count as jest.Mock).mockResolvedValue(10)
      ;(prisma.leave.count as jest.Mock)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5)
      ;(prisma.leaveBalance.findMany as jest.Mock).mockResolvedValue([])

      await companyStatsService.getCompanyStats('company-1', mockUser)

      // Verify that the leave count query uses the current date
      expect(prisma.leave.count).toHaveBeenCalledWith({
        where: {
          membership: {
            companyId: 'company-1',
          },
          status: 'APPROVED',
          startDate: {
            lte: mockDate,
          },
          endDate: {
            gte: mockDate,
          },
        },
      })

      jest.restoreAllMocks()
    })
  })
})
