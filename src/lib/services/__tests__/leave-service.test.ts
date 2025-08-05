import { User } from 'better-auth'

import {
  HalfDayPeriod,
  LeaveStatus,
  LeaveType,
  UserRole,
} from '@/generated/prisma'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

import { calculateWorkingDays, leaveService } from '../leave-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    leave: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    leaveBalance: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    leaveBalanceHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any

describe('calculateWorkingDays', () => {
  it('should calculate working days correctly for a full week', () => {
    const startDate = new Date('2024-01-01') // Monday
    const endDate = new Date('2024-01-05') // Friday
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(5)
  })

  it('should exclude weekends', () => {
    const startDate = new Date('2024-01-01') // Monday
    const endDate = new Date('2024-01-07') // Sunday
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(5) // Only weekdays
  })

  it('should calculate single day correctly', () => {
    const startDate = new Date('2024-01-01') // Monday
    const endDate = new Date('2024-01-01') // Same Monday
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(1)
  })

  it('should return 0 for weekend-only period', () => {
    const startDate = new Date('2024-01-06') // Saturday
    const endDate = new Date('2024-01-07') // Sunday
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(0)
  })

  it('should handle periods starting on weekend', () => {
    const startDate = new Date('2024-01-06') // Saturday
    const endDate = new Date('2024-01-08') // Monday
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(1) // Only Monday
  })

  it('should handle periods ending on weekend', () => {
    const startDate = new Date('2024-01-05') // Friday
    const endDate = new Date('2024-01-07') // Sunday
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(1) // Only Friday
  })

  it('should calculate multiple weeks correctly', () => {
    const startDate = new Date('2024-01-01') // Monday
    const endDate = new Date('2024-01-12') // Friday (next week)
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(10) // 2 full weeks
  })

  it('should calculate half days correctly', () => {
    const startDate = new Date('2024-01-01') // Monday
    const endDate = new Date('2024-01-01') // Same day
    const result = calculateWorkingDays(
      startDate,
      endDate,
      HalfDayPeriod.MORNING
    )
    expect(result).toBe(0.5)
  })

  it('should handle single day correctly', () => {
    const startDate = new Date('2024-01-01') // Monday
    const endDate = new Date('2024-01-01') // Same day
    const result = calculateWorkingDays(startDate, endDate)
    expect(result).toBe(1)
  })
})

describe('leaveService', () => {
  const mockUser: Pick<User, 'id'> = { id: 'user-1' }
  const mockMembership = {
    id: 'membership-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: UserRole.EMPLOYEE,
  }
  const mockLeave = {
    id: 'leave-1',
    membershipId: 'membership-1',
    type: LeaveType.PAID,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-05'),
    status: LeaveStatus.PENDING,
    reason: 'Vacation',
    membership: {
      companyId: 'company-1',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLeavesForMembership', () => {
    it('should return leaves for valid membership', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)
      mockPrisma.leave.findMany.mockResolvedValue([mockLeave])

      const result = await leaveService.getLeavesForMembership(
        'membership-1',
        mockUser
      )

      expect(result).toEqual([mockLeave])
      expect(mockPrisma.membership.findUnique).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
      })
    })

    it('should throw error for non-existent membership', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(null)

      await expect(
        leaveService.getLeavesForMembership('invalid-id', mockUser)
      ).rejects.toThrow(ApiError)
    })

    it('should throw error for unauthorized access', async () => {
      const otherMembership = { ...mockMembership, userId: 'other-user' }
      mockPrisma.membership.findUnique.mockResolvedValue(otherMembership)
      mockPrisma.membership.findFirst.mockResolvedValue(null)

      await expect(
        leaveService.getLeavesForMembership('membership-1', mockUser)
      ).rejects.toThrow('Accès interdit')
    })
  })

  describe('createLeave', () => {
    const createData = {
      type: LeaveType.PAID,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      reason: 'Vacation',
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create leave successfully', async () => {
      const mockLeaveBalance = {
        id: 'balance-1',
        remainingDays: 10,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)
      mockPrisma.leaveBalance.findFirst.mockResolvedValue(mockLeaveBalance)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma)
      })
      mockPrisma.leave.create.mockResolvedValue(mockLeave)

      const result = await leaveService.createLeave(
        'membership-1',
        createData,
        mockUser
      )

      expect(result).toEqual(mockLeave)
      expect(mockPrisma.leave.create).toHaveBeenCalled()
    })

    it('should throw error for insufficient leave balance', async () => {
      const mockLeaveBalance = {
        id: 'balance-1',
        remainingDays: 2, // Less than required 5 days
      }

      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)
      mockPrisma.leaveBalance.findFirst.mockResolvedValue(mockLeaveBalance)
      // Don't mock leave.create as it should not be called
      mockPrisma.leave.create.mockClear()

      await expect(
        leaveService.createLeave('membership-1', createData, mockUser)
      ).rejects.toThrow('Solde de congés insuffisant')
    })
  })

  describe('reviewLeave', () => {
    const reviewData = {
      status: LeaveStatus.APPROVED,
      reviewComment: 'Approved',
    }

    it('should approve leave successfully', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma)
      })
      mockPrisma.leave.update.mockResolvedValue({
        ...mockLeave,
        status: LeaveStatus.APPROVED,
      })

      const result = await leaveService.reviewLeave(
        'company-1',
        'leave-1',
        reviewData,
        mockUser
      )

      expect(result.status).toBe(LeaveStatus.APPROVED)
      expect(mockPrisma.leave.update).toHaveBeenCalled()
    })

    it('should throw error for non-manager user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)

      await expect(
        leaveService.reviewLeave('company-1', 'leave-1', reviewData, mockUser)
      ).rejects.toThrow("Accès refusé : vous n'êtes pas manager")
    })
  })

  describe('getCompanyLeaves', () => {
    it('should return company leaves for manager', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.leave.findMany.mockResolvedValue([mockLeave])

      const result = await leaveService.getCompanyLeaves('company-1', mockUser)

      expect(result).toEqual([mockLeave])
      expect(mockPrisma.leave.findMany).toHaveBeenCalled()
    })

    it('should throw error for non-manager user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)

      await expect(
        leaveService.getCompanyLeaves('company-1', mockUser)
      ).rejects.toThrow('Accès refusé')
    })
  })

  describe('deleteLeave', () => {
    it('should delete leave successfully', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)
      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockPrisma)
      })
      mockPrisma.leave.delete.mockResolvedValue(mockLeave)

      await leaveService.deleteLeave(
        'company-1',
        'membership-1',
        'leave-1',
        mockUser
      )

      expect(mockPrisma.leave.delete).toHaveBeenCalledWith({
        where: { id: 'leave-1' },
      })
    })

    it('should throw error for non-existent leave', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)
      mockPrisma.leave.findUnique.mockResolvedValue(null)

      await expect(
        leaveService.deleteLeave(
          'company-1',
          'membership-1',
          'leave-1',
          mockUser
        )
      ).rejects.toThrow('Congé non trouvé')
    })
  })

  describe('getLeaveStats', () => {
    it('should return leave stats for manager', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }
      const mockStats = {
        totalLeaves: 10,
        pendingLeaves: 2,
        approvedLeaves: 7,
        rejectedLeaves: 1,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.leave.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(7) // approved
        .mockResolvedValueOnce(1) // rejected

      const result = await leaveService.getLeaveStats('company-1', mockUser)

      expect(result).toEqual(mockStats)
    })

    it('should throw error for non-manager user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)

      await expect(
        leaveService.getLeaveStats('company-1', mockUser)
      ).rejects.toThrow('Accès refusé')
    })
  })
})
