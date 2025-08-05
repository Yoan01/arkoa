import {
  HalfDayPeriod,
  LeaveStatus,
  LeaveType,
  UserRole,
} from '@/generated/prisma'

import { CompanyStats, CompanyStatsSchema } from '../company-stats-schema'
import {
  CreateCompanyInput,
  CreateCompanySchema,
} from '../create-company-schema'
import { CreateLeaveInput, CreateLeaveSchema } from '../create-leave-schema'
import {
  MembershipWithUserAndBalances,
  membershipWithUserAndBalancesSchema,
} from '../edit-leave-balance-dialog-schema'
import { InviteMemberInput, InviteMemberSchema } from '../invite-member-schema'
import { ReviewLeaveInput, ReviewLeaveSchema } from '../review-leave-schema'
import {
  UpdateCompanyInput,
  UpdateCompanySchema,
} from '../update-company-schema'
import {
  UpdateLeaveBalanceInput,
  UpdateLeaveBalanceSchema,
} from '../update-leave-balance-schema'
import { UpdateLeaveInput, UpdateLeaveSchema } from '../update-leave-schema'
import {
  UpdateMembershipInput,
  UpdateMembershipSchema,
} from '../update-membership-schema'

describe('Mutations Schemas', () => {
  describe('CreateCompanySchema', () => {
    describe('valid inputs', () => {
      it('should validate a complete valid company object', () => {
        const validCompany: CreateCompanyInput = {
          name: 'Test Company',
          logoUrl: 'https://example.com/logo.png',
          annualLeaveDays: 25,
        }

        const result = CreateCompanySchema.safeParse(validCompany)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(validCompany)
        }
      })

      it('should validate company without logoUrl', () => {
        const validCompany = {
          name: 'Test Company',
          annualLeaveDays: 30,
        }

        const result = CreateCompanySchema.safeParse(validCompany)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.logoUrl).toBeUndefined()
        }
      })
    })

    describe('invalid inputs', () => {
      it('should reject company without name', () => {
        const invalidCompany = {
          annualLeaveDays: 25,
        }

        const result = CreateCompanySchema.safeParse(invalidCompany)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['name'])
        }
      })

      it('should reject company with annualLeaveDays less than 25', () => {
        const invalidCompany = {
          name: 'Test Company',
          annualLeaveDays: 24,
        }

        const result = CreateCompanySchema.safeParse(invalidCompany)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('CreateLeaveSchema', () => {
    describe('valid inputs', () => {
      it('should validate a complete valid leave object', () => {
        const validLeave: CreateLeaveInput = {
          type: LeaveType.PAID,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-05'),
          reason: 'Vacation',
        }

        const result = CreateLeaveSchema.safeParse(validLeave)
        expect(result.success).toBe(true)
      })

      it('should validate leave with half day period for same date', () => {
        const validLeave = {
          type: LeaveType.PAID,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01'),
          halfDayPeriod: HalfDayPeriod.MORNING,
        }

        const result = CreateLeaveSchema.safeParse(validLeave)
        expect(result.success).toBe(true)
      })

      it('should validate leave without reason', () => {
        const validLeave = {
          type: LeaveType.SICK,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02'),
        }

        const result = CreateLeaveSchema.safeParse(validLeave)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject leave without required fields', () => {
        const invalidLeave = {
          reason: 'Vacation',
        }

        const result = CreateLeaveSchema.safeParse(invalidLeave)
        expect(result.success).toBe(false)
      })

      it('should reject half day period with different dates', () => {
        const invalidLeave = {
          type: LeaveType.PAID,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02'),
          halfDayPeriod: HalfDayPeriod.MORNING,
        }

        const result = CreateLeaveSchema.safeParse(invalidLeave)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Pour une demi-journée, vous devez sélectionner une seule date'
          )
        }
      })
    })
  })

  describe('UpdateLeaveSchema', () => {
    describe('valid inputs', () => {
      it('should validate a complete valid update leave object', () => {
        const validLeave: UpdateLeaveInput = {
          type: LeaveType.PAID,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-05'),
          reason: 'Updated vacation',
        }

        const result = UpdateLeaveSchema.safeParse(validLeave)
        expect(result.success).toBe(true)
      })

      it('should validate leave with half day period for same date', () => {
        const validLeave = {
          type: LeaveType.PAID,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01'),
          halfDayPeriod: HalfDayPeriod.AFTERNOON,
        }

        const result = UpdateLeaveSchema.safeParse(validLeave)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject half day period with different dates', () => {
        const invalidLeave = {
          type: LeaveType.PAID,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-03'),
          halfDayPeriod: HalfDayPeriod.MORNING,
        }

        const result = UpdateLeaveSchema.safeParse(invalidLeave)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Pour une demi-journée, vous devez sélectionner une seule date'
          )
        }
      })
    })
  })

  describe('ReviewLeaveSchema', () => {
    describe('valid inputs', () => {
      it('should validate approved status', () => {
        const validReview: ReviewLeaveInput = {
          status: LeaveStatus.APPROVED,
        }

        const result = ReviewLeaveSchema.safeParse(validReview)
        expect(result.success).toBe(true)
      })

      it('should validate rejected status with manager note', () => {
        const validReview = {
          status: LeaveStatus.REJECTED,
          managerNote: 'Not enough coverage',
        }

        const result = ReviewLeaveSchema.safeParse(validReview)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject invalid status', () => {
        const invalidReview = {
          status: LeaveStatus.PENDING,
        }

        const result = ReviewLeaveSchema.safeParse(invalidReview)
        expect(result.success).toBe(false)
      })

      it('should reject without status', () => {
        const invalidReview = {
          managerNote: 'Some note',
        }

        const result = ReviewLeaveSchema.safeParse(invalidReview)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('UpdateCompanySchema', () => {
    describe('valid inputs', () => {
      it('should validate a complete valid update company object', () => {
        const validCompany: UpdateCompanyInput = {
          id: 'company-123',
          name: 'Updated Company',
          logoUrl: 'https://example.com/new-logo.png',
          annualLeaveDays: 30,
        }

        const result = UpdateCompanySchema.safeParse(validCompany)
        expect(result.success).toBe(true)
      })

      it('should validate company without logoUrl', () => {
        const validCompany = {
          id: 'company-123',
          name: 'Updated Company',
          annualLeaveDays: 25,
        }

        const result = UpdateCompanySchema.safeParse(validCompany)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject company without id', () => {
        const invalidCompany = {
          name: 'Updated Company',
          annualLeaveDays: 25,
        }

        const result = UpdateCompanySchema.safeParse(invalidCompany)
        expect(result.success).toBe(false)
      })

      it('should reject company with empty id', () => {
        const invalidCompany = {
          id: '',
          name: 'Updated Company',
          annualLeaveDays: 25,
        }

        const result = UpdateCompanySchema.safeParse(invalidCompany)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "L'id de l'entreprise est requis"
          )
        }
      })

      it('should reject company with annualLeaveDays less than 25', () => {
        const invalidCompany = {
          id: 'company-123',
          name: 'Updated Company',
          annualLeaveDays: 20,
        }

        const result = UpdateCompanySchema.safeParse(invalidCompany)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('InviteMemberSchema', () => {
    describe('valid inputs', () => {
      it('should validate a complete valid invite member object', () => {
        const validInvite: InviteMemberInput = {
          email: 'test@example.com',
          role: UserRole.EMPLOYEE,
        }

        const result = InviteMemberSchema.safeParse(validInvite)
        expect(result.success).toBe(true)
      })

      it('should validate with MANAGER role', () => {
        const validInvite = {
          email: 'manager@example.com',
          role: UserRole.MANAGER,
        }

        const result = InviteMemberSchema.safeParse(validInvite)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject invalid email', () => {
        const invalidInvite = {
          email: 'invalid-email',
          role: UserRole.EMPLOYEE,
        }

        const result = InviteMemberSchema.safeParse(invalidInvite)
        expect(result.success).toBe(false)
      })

      it('should reject without email', () => {
        const invalidInvite = {
          role: UserRole.EMPLOYEE,
        }

        const result = InviteMemberSchema.safeParse(invalidInvite)
        expect(result.success).toBe(false)
      })

      it('should reject without role', () => {
        const invalidInvite = {
          email: 'test@example.com',
        }

        const result = InviteMemberSchema.safeParse(invalidInvite)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('UpdateMembershipSchema', () => {
    describe('valid inputs', () => {
      it('should validate with EMPLOYEE role', () => {
        const validUpdate: UpdateMembershipInput = {
          role: UserRole.EMPLOYEE,
        }

        const result = UpdateMembershipSchema.safeParse(validUpdate)
        expect(result.success).toBe(true)
      })

      it('should validate with MANAGER role', () => {
        const validUpdate = {
          role: UserRole.MANAGER,
        }

        const result = UpdateMembershipSchema.safeParse(validUpdate)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject without role', () => {
        const invalidUpdate = {}

        const result = UpdateMembershipSchema.safeParse(invalidUpdate)
        expect(result.success).toBe(false)
      })

      it('should reject invalid role', () => {
        const invalidUpdate = {
          role: 'INVALID_ROLE',
        }

        const result = UpdateMembershipSchema.safeParse(invalidUpdate)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('UpdateLeaveBalanceSchema', () => {
    describe('valid inputs', () => {
      it('should validate a complete valid update leave balance object', () => {
        const validUpdate: UpdateLeaveBalanceInput = {
          type: LeaveType.PAID,
          change: 2.5,
          reason: 'Bonus days',
        }

        const result = UpdateLeaveBalanceSchema.safeParse(validUpdate)
        expect(result.success).toBe(true)
      })

      it('should validate negative change', () => {
        const validUpdate = {
          type: LeaveType.SICK,
          change: -1.5,
        }

        const result = UpdateLeaveBalanceSchema.safeParse(validUpdate)
        expect(result.success).toBe(true)
      })

      it('should validate half day change', () => {
        const validUpdate = {
          type: LeaveType.PAID,
          change: 0.5,
        }

        const result = UpdateLeaveBalanceSchema.safeParse(validUpdate)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject zero change', () => {
        const invalidUpdate = {
          type: LeaveType.PAID,
          change: 0,
        }

        const result = UpdateLeaveBalanceSchema.safeParse(invalidUpdate)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'La modification ne peut pas être de 0 jour'
          )
        }
      })

      it('should reject change not multiple of 0.5', () => {
        const invalidUpdate = {
          type: LeaveType.PAID,
          change: 1.3,
        }

        const result = UpdateLeaveBalanceSchema.safeParse(invalidUpdate)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'La modification doit être un multiple de 0,5 (demi-journée)'
          )
        }
      })

      it('should reject change greater than 365', () => {
        const invalidUpdate = {
          type: LeaveType.PAID,
          change: 400,
        }

        const result = UpdateLeaveBalanceSchema.safeParse(invalidUpdate)
        expect(result.success).toBe(false)
      })

      it('should reject change less than -365', () => {
        const invalidUpdate = {
          type: LeaveType.PAID,
          change: -400,
        }

        const result = UpdateLeaveBalanceSchema.safeParse(invalidUpdate)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('CompanyStatsSchema', () => {
    describe('valid inputs', () => {
      it('should validate complete valid company stats', () => {
        const validStats: CompanyStats = {
          totalEmployees: 50,
          employeesOnLeave: 5,
          pendingRequests: 3,
          averageLeaveBalance: 20.5,
        }

        const result = CompanyStatsSchema.safeParse(validStats)
        expect(result.success).toBe(true)
      })

      it('should validate with zero values', () => {
        const validStats = {
          totalEmployees: 0,
          employeesOnLeave: 0,
          pendingRequests: 0,
          averageLeaveBalance: 0,
        }

        const result = CompanyStatsSchema.safeParse(validStats)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject negative totalEmployees', () => {
        const invalidStats = {
          totalEmployees: -1,
          employeesOnLeave: 0,
          pendingRequests: 0,
          averageLeaveBalance: 0,
        }

        const result = CompanyStatsSchema.safeParse(invalidStats)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Le nombre total d'employés doit être positif"
          )
        }
      })

      it('should reject negative employeesOnLeave', () => {
        const invalidStats = {
          totalEmployees: 10,
          employeesOnLeave: -1,
          pendingRequests: 0,
          averageLeaveBalance: 0,
        }

        const result = CompanyStatsSchema.safeParse(invalidStats)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Le nombre d'employés en congé doit être positif"
          )
        }
      })

      it('should reject negative pendingRequests', () => {
        const invalidStats = {
          totalEmployees: 10,
          employeesOnLeave: 2,
          pendingRequests: -1,
          averageLeaveBalance: 0,
        }

        const result = CompanyStatsSchema.safeParse(invalidStats)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Le nombre de demandes en attente doit être positif'
          )
        }
      })

      it('should reject negative averageLeaveBalance', () => {
        const invalidStats = {
          totalEmployees: 10,
          employeesOnLeave: 2,
          pendingRequests: 1,
          averageLeaveBalance: -5,
        }

        const result = CompanyStatsSchema.safeParse(invalidStats)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Le solde moyen de congés doit être positif'
          )
        }
      })
    })
  })

  describe('membershipWithUserAndBalancesSchema', () => {
    describe('valid inputs', () => {
      it('should validate membership with user and balances', () => {
        const validMembership: MembershipWithUserAndBalances = {
          id: 'membership-123',
          userId: 'user-123',
          companyId: 'company-123',
          role: UserRole.EMPLOYEE,
          onLeave: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-123',
            email: 'test@example.com',
            emailVerified: true,
            name: 'Test User',
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          leaveBalances: [
            {
              id: 'balance-123',
              type: 'ANNUAL',
              remainingDays: 25,
            },
          ],
        }

        const result =
          membershipWithUserAndBalancesSchema.safeParse(validMembership)
        expect(result.success).toBe(true)
      })

      it('should validate membership without leave balances', () => {
        const validMembership = {
          id: 'membership-123',
          userId: 'user-123',
          companyId: 'company-123',
          role: UserRole.EMPLOYEE,
          onLeave: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }

        const result =
          membershipWithUserAndBalancesSchema.safeParse(validMembership)
        expect(result.success).toBe(true)
      })
    })

    describe('invalid inputs', () => {
      it('should reject membership without user', () => {
        const invalidMembership = {
          id: 'membership-123',
          userId: 'user-123',
          companyId: 'company-123',
          role: UserRole.EMPLOYEE,
          onLeave: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result =
          membershipWithUserAndBalancesSchema.safeParse(invalidMembership)
        expect(result.success).toBe(false)
      })

      it('should reject invalid leave balance structure', () => {
        const invalidMembership = {
          id: 'membership-123',
          userId: 'user-123',
          companyId: 'company-123',
          role: UserRole.EMPLOYEE,
          onLeave: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          leaveBalances: [
            {
              id: 'balance-123',
              // missing type and remainingDays
            },
          ],
        }

        const result =
          membershipWithUserAndBalancesSchema.safeParse(invalidMembership)
        expect(result.success).toBe(false)
      })
    })
  })
})
