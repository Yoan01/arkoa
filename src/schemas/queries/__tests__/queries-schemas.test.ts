import {
  HalfDayPeriod,
  LeaveStatus,
  LeaveType,
  UserRole,
} from '@/generated/prisma'

import {
  companyLeaveSchema,
  getCompanyLeavesParamsSchema,
  getCompanyLeavesResponseSchema,
} from '../company-leaves-schema'
import { UserCompanyRoleSchema } from '../company-role-schema'
import { leaveBalanceHistoryWithActorAndTypeSchema } from '../leave-balance-history-whit-actor-and-type-schema'
import {
  getLeaveStatsParamsSchema,
  leaveStatsResponseSchema,
} from '../leave-stats-schema'
import { membershipWithUserAndCompanySchema } from '../membership-with-user-and-company-schema'
import { membershipWithUserSchema } from '../membership-with-user-schema'
import { UserCompanySchema } from '../user-company-schema'

describe('Query Schemas', () => {
  describe('companyLeaveSchema', () => {
    it('should validate a valid company leave object', () => {
      const validLeave = {
        id: 'leave-123',
        type: 'PAID',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-16'),
        halfDayPeriod: HalfDayPeriod.MORNING,
        reason: 'Personal leave',
        status: LeaveStatus.PENDING,
        createdAt: new Date('2024-01-01'),
        managerNote: 'Approved by manager',
        membership: {
          user: {
            id: 'user-123',
            name: 'John Doe',
          },
        },
      }

      const result = companyLeaveSchema.safeParse(validLeave)
      expect(result.success).toBe(true)
    })

    it('should reject invalid company leave object', () => {
      const invalidLeave = {
        id: 'leave-123',
        type: 'PAID',
        startDate: 'invalid-date',
        endDate: new Date('2024-01-16'),
        status: 'INVALID_STATUS',
        membership: {
          user: {
            id: 'user-123',
            name: 'John Doe',
          },
        },
      }

      const result = companyLeaveSchema.safeParse(invalidLeave)
      expect(result.success).toBe(false)
    })
  })

  describe('getCompanyLeavesParamsSchema', () => {
    it('should validate valid params', () => {
      const validParams = {
        companyId: 'company-123',
        status: LeaveStatus.APPROVED,
      }

      const result = getCompanyLeavesParamsSchema.safeParse(validParams)
      expect(result.success).toBe(true)
    })

    it('should validate params without optional status', () => {
      const validParams = {
        companyId: 'company-123',
      }

      const result = getCompanyLeavesParamsSchema.safeParse(validParams)
      expect(result.success).toBe(true)
    })

    it('should reject invalid params', () => {
      const invalidParams = {
        companyId: 123, // should be string
        status: 'INVALID_STATUS',
      }

      const result = getCompanyLeavesParamsSchema.safeParse(invalidParams)
      expect(result.success).toBe(false)
    })
  })

  describe('getCompanyLeavesResponseSchema', () => {
    it('should validate array of company leaves', () => {
      const validResponse = [
        {
          id: 'leave-123',
          type: 'PAID',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-16'),
          status: LeaveStatus.PENDING,
          createdAt: new Date('2024-01-01'),
          membership: {
            user: {
              id: 'user-123',
              name: 'John Doe',
            },
          },
        },
      ]

      const result = getCompanyLeavesResponseSchema.safeParse(validResponse)
      expect(result.success).toBe(true)
    })
  })

  describe('UserCompanyRoleSchema', () => {
    it('should validate valid user company role', () => {
      const validRole = {
        role: UserRole.MANAGER,
        isManager: true,
      }

      const result = UserCompanyRoleSchema.safeParse(validRole)
      expect(result.success).toBe(true)
    })

    it('should reject invalid role', () => {
      const invalidRole = {
        role: 'INVALID_ROLE',
        isManager: 'not-boolean',
      }

      const result = UserCompanyRoleSchema.safeParse(invalidRole)
      expect(result.success).toBe(false)
    })
  })

  describe('leaveBalanceHistoryWithActorAndTypeSchema', () => {
    it('should validate valid leave balance history', () => {
      const validHistory = {
        id: 'history-123',
        leaveBalanceId: 'balance-123',
        change: 5,
        reason: 'Annual allocation',
        createdAt: new Date('2024-01-01'),
        actor: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        leaveBalance: {
          type: LeaveType.PAID,
        },
      }

      const result =
        leaveBalanceHistoryWithActorAndTypeSchema.safeParse(validHistory)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email in actor', () => {
      const invalidHistory = {
        id: 'history-123',
        leaveBalanceId: 'balance-123',
        change: 5,
        createdAt: new Date('2024-01-01'),
        actor: {
          id: 'user-123',
          name: 'John Doe',
          email: 'invalid-email',
        },
        leaveBalance: {
          type: LeaveType.PAID,
        },
      }

      const result =
        leaveBalanceHistoryWithActorAndTypeSchema.safeParse(invalidHistory)
      expect(result.success).toBe(false)
    })
  })

  describe('getLeaveStatsParamsSchema', () => {
    it('should validate valid params', () => {
      const validParams = {
        companyId: 'company-123',
      }

      const result = getLeaveStatsParamsSchema.safeParse(validParams)
      expect(result.success).toBe(true)
    })

    it('should reject missing companyId', () => {
      const invalidParams = {}

      const result = getLeaveStatsParamsSchema.safeParse(invalidParams)
      expect(result.success).toBe(false)
    })
  })

  describe('leaveStatsResponseSchema', () => {
    it('should validate valid stats response', () => {
      const validStats = {
        pending: 5,
        approved: 10,
        rejected: 2,
      }

      const result = leaveStatsResponseSchema.safeParse(validStats)
      expect(result.success).toBe(true)
    })

    it('should reject non-numeric values', () => {
      const invalidStats = {
        pending: '5',
        approved: 10,
        rejected: 2,
      }

      const result = leaveStatsResponseSchema.safeParse(invalidStats)
      expect(result.success).toBe(false)
    })
  })

  describe('membershipWithUserAndCompanySchema', () => {
    it('should validate valid membership with user and company', () => {
      const validMembership = {
        id: 'membership-123',
        userId: 'user-123',
        companyId: 'company-123',
        role: UserRole.EMPLOYEE,
        onLeave: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          image: 'https://example.com/avatar.jpg',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        company: {
          name: 'Test Company',
          createdAt: new Date('2024-01-01'),
        },
      }

      const result =
        membershipWithUserAndCompanySchema.safeParse(validMembership)
      expect(result.success).toBe(true)
    })
  })

  describe('membershipWithUserSchema', () => {
    it('should validate valid membership with user', () => {
      const validMembership = {
        id: 'membership-123',
        userId: 'user-123',
        companyId: 'company-123',
        role: UserRole.EMPLOYEE,
        onLeave: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      }

      const result = membershipWithUserSchema.safeParse(validMembership)
      expect(result.success).toBe(true)
    })
  })

  describe('UserCompanySchema', () => {
    it('should validate valid user company', () => {
      const validUserCompany = {
        id: 'company-123',
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        annualLeaveDays: 25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        userMembershipId: 'membership-123',
        userRole: UserRole.MANAGER,
      }

      const result = UserCompanySchema.safeParse(validUserCompany)
      expect(result.success).toBe(true)
    })

    it('should validate with null logoUrl', () => {
      const validUserCompany = {
        id: 'company-123',
        name: 'Test Company',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        userMembershipId: 'membership-123',
        userRole: UserRole.EMPLOYEE,
      }

      const result = UserCompanySchema.safeParse(validUserCompany)
      expect(result.success).toBe(true)
    })

    it('should reject invalid user role', () => {
      const invalidUserCompany = {
        id: 'company-123',
        name: 'Test Company',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        userMembershipId: 'membership-123',
        userRole: 'INVALID_ROLE',
      }

      const result = UserCompanySchema.safeParse(invalidUserCompany)
      expect(result.success).toBe(false)
    })
  })
})
