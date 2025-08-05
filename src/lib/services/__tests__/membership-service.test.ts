import { User } from 'better-auth'

import { UserRole } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'

import { membershipService } from '../membership-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    leaveBalance: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const mockPrisma = prisma as any

describe('membershipService', () => {
  const mockUser: Pick<User, 'id'> = { id: 'user-1' }
  const mockMembership = {
    id: 'membership-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: UserRole.EMPLOYEE,
    active: true,
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    leaveBalances: [
      {
        id: 'balance-1',
        type: 'PAID',
        remainingDays: 25,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMemberships', () => {
    it('should return memberships for authorized user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)
      mockPrisma.membership.findMany.mockResolvedValue([mockMembership])

      const result = await membershipService.getMemberships(
        'company-1',
        mockUser
      )

      expect(result).toEqual([mockMembership])
      expect(mockPrisma.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: 'user-1',
            companyId: 'company-1',
          },
        },
      })
    })

    it('should throw error for unauthorized user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(null)

      await expect(
        membershipService.getMemberships('company-1', mockUser)
      ).rejects.toThrow('Accès interdit')
    })
  })

  describe('getMembershipById', () => {
    it('should return membership for authorized user', async () => {
      mockPrisma.membership.findUnique
        .mockResolvedValueOnce(mockMembership) // Current user membership
        .mockResolvedValueOnce(mockMembership) // Target membership

      const result = await membershipService.getMembershipById(
        'company-1',
        'membership-1',
        mockUser
      )

      expect(result).toEqual(mockMembership)
    })

    it('should throw error for non-existent membership', async () => {
      mockPrisma.membership.findUnique
        .mockResolvedValueOnce(mockMembership) // Current user membership
        .mockResolvedValueOnce(null) // Target membership not found

      await expect(
        membershipService.getMembershipById('company-1', 'invalid-id', mockUser)
      ).rejects.toThrow('Membre non trouvé')
    })

    it('should throw error for unauthorized access', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(null)

      await expect(
        membershipService.getMembershipById(
          'company-1',
          'membership-1',
          mockUser
        )
      ).rejects.toThrow('Accès interdit à cette entreprise')
    })
  })

  describe('inviteMember', () => {
    const inviteData = {
      email: 'newuser@example.com',
      role: UserRole.EMPLOYEE,
    }

    it('should invite new member successfully', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }
      const existingUser = {
        id: 'user-2',
        email: 'newuser@example.com',
        name: 'Existing User',
      }
      const newMembership = {
        id: 'membership-2',
        userId: 'user-2',
        companyId: 'company-1',
        role: UserRole.EMPLOYEE,
      }

      mockPrisma.membership.findUnique
        .mockResolvedValueOnce(managerMembership) // Current user membership
        .mockResolvedValueOnce(null) // No existing membership for invited user
      mockPrisma.user.findUnique.mockResolvedValue(existingUser) // User exists
      mockPrisma.membership.create.mockResolvedValue(newMembership)

      const result = await membershipService.inviteMember(
        'company-1',
        inviteData,
        mockUser
      )

      expect(result).toEqual(newMembership)
      expect(mockPrisma.membership.create).toHaveBeenCalled()
    })

    it('should throw error for non-existing user', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.user.findUnique.mockResolvedValue(null) // User doesn't exist

      await expect(
        membershipService.inviteMember('company-1', inviteData, mockUser)
      ).rejects.toThrow(
        "Aucun utilisateur trouvé avec cet email. Il doit d'abord créer un compte."
      )
    })

    it('should throw error for non-manager user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)

      await expect(
        membershipService.inviteMember('company-1', inviteData, mockUser)
      ).rejects.toThrow('Seuls les managers peuvent inviter')
    })

    it('should throw error for existing membership', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }
      const existingUser = {
        id: 'user-2',
        email: 'newuser@example.com',
        name: 'Existing User',
      }
      const existingMembership = {
        id: 'membership-2',
        userId: 'user-2',
        companyId: 'company-1',
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.membership.findFirst.mockResolvedValue(existingMembership)

      await expect(
        membershipService.inviteMember('company-1', inviteData, mockUser)
      ).rejects.toThrow("Cet utilisateur est déjà membre de l'entreprise.")
    })
  })

  describe('updateMembership', () => {
    const updateData = {
      role: UserRole.MANAGER,
    }

    it('should update membership successfully', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }
      const updatedMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.membership.update.mockResolvedValue(updatedMembership)

      const result = await membershipService.updateMembership(
        'company-1',
        'membership-1',
        updateData,
        mockUser
      )

      expect(result).toEqual(updatedMembership)
      expect(mockPrisma.membership.update).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
        data: updateData,
      })
    })

    it('should throw error for non-manager user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)

      await expect(
        membershipService.updateMembership(
          'company-1',
          'membership-1',
          updateData,
          mockUser
        )
      ).rejects.toThrow('Seul un manager peut modifier les rôles')
    })
  })

  describe('deleteMembership', () => {
    it('should delete membership successfully', async () => {
      const managerMembership = {
        ...mockMembership,
        role: UserRole.MANAGER,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.membership.delete.mockResolvedValue(mockMembership)

      await membershipService.deleteMembership(
        'company-1',
        'membership-1',
        mockUser
      )

      expect(mockPrisma.membership.delete).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
      })
    })

    it('should throw error for non-manager user', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(mockMembership)

      await expect(
        membershipService.deleteMembership(
          'company-1',
          'membership-1',
          mockUser
        )
      ).rejects.toThrow('Seul un manager peut supprimer un membre')
    })
  })
})
