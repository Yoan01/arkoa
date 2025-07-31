import { PrismaClient } from '@/generated/prisma'
import { ApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

import { companyService } from '../company-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    company: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

type MockedPrismaClient = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock
  }
} & {
  $transaction: jest.Mock
}

const mockPrisma = prisma as unknown as MockedPrismaClient
describe('CompanyService', () => {
  const mockUser = { id: 'user-123' }
  const mockCompany = {
    id: 'company-123',
    name: 'Test Company',
    logoUrl: 'https://example.com/logo.png',
    annualLeaveDays: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockMembership = {
    id: 'membership-123',
    userId: 'user-123',
    companyId: 'company-123',
    role: 'MANAGER' as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCompaniesForUser', () => {
    it('should return companies for user with membership info', async () => {
      const mockMemberships = [
        {
          ...mockMembership,
          company: mockCompany,
        },
      ]

      mockPrisma.membership.findMany.mockResolvedValue(mockMemberships)

      const result = await companyService.getCompaniesForUser(mockUser)

      expect(mockPrisma.membership.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: { company: true },
      })

      expect(result).toEqual([
        {
          ...mockCompany,
          userMembershipId: mockMembership.id,
          userRole: mockMembership.role,
        },
      ])
    })

    it('should return empty array when user has no companies', async () => {
      mockPrisma.membership.findMany.mockResolvedValue([])

      const result = await companyService.getCompaniesForUser(mockUser)

      expect(result).toEqual([])
    })
  })

  describe('createCompany', () => {
    const createData = {
      name: 'New Company',
      logoUrl: 'https://example.com/new-logo.png',
      annualLeaveDays: 30,
    }

    it('should create company with user as manager', async () => {
      const mockCreatedCompany = {
        ...mockCompany,
        ...createData,
        memberships: [mockMembership],
      }

      mockPrisma.company.create.mockResolvedValue(mockCreatedCompany)

      const result = await companyService.createCompany(createData, mockUser)

      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          logoUrl: createData.logoUrl,
          annualLeaveDays: createData.annualLeaveDays,
          memberships: {
            create: {
              userId: mockUser.id,
              role: 'MANAGER',
            },
          },
        },
        include: {
          memberships: {
            where: { userId: mockUser.id },
          },
        },
      })

      expect(result).toEqual({
        ...mockCreatedCompany,
        userMembershipId: mockMembership.id,
      })
    })
  })

  describe('getCompanyById', () => {
    it('should return company when user has access', async () => {
      const mockMembershipWithCompany = {
        ...mockMembership,
        company: mockCompany,
      }

      mockPrisma.membership.findUnique.mockResolvedValue(
        mockMembershipWithCompany
      )

      const result = await companyService.getCompanyById(
        mockCompany.id,
        mockUser
      )

      expect(mockPrisma.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: mockUser.id,
            companyId: mockCompany.id,
          },
        },
        include: { company: true },
      })

      expect(result).toEqual(mockCompany)
    })

    it('should throw ApiError when user has no access to company', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(null)

      await expect(
        companyService.getCompanyById(mockCompany.id, mockUser)
      ).rejects.toThrow(ApiError)

      await expect(
        companyService.getCompanyById(mockCompany.id, mockUser)
      ).rejects.toThrow('Entreprise non trouvée ou accès refusé')
    })
  })

  describe('updateCompany', () => {
    const updateData = {
      name: 'Updated Company',
      logoUrl: 'https://example.com/updated-logo.png',
      annualLeaveDays: 28,
    }

    it('should update company when user is manager', async () => {
      const managerMembership = { ...mockMembership, role: 'MANAGER' as const }
      const updatedCompany = { ...mockCompany, ...updateData }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.company.update.mockResolvedValue(updatedCompany)

      const result = await companyService.updateCompany(
        mockCompany.id,
        { id: mockCompany.id, ...updateData },
        mockUser
      )

      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: mockCompany.id },
        data: updateData,
      })

      expect(result).toEqual({
        ...updatedCompany,
        userMembershipId: managerMembership.id,
        userRole: managerMembership.role,
      })
    })

    it('should throw ApiError when user is not manager', async () => {
      const employeeMembership = {
        ...mockMembership,
        role: 'EMPLOYEE' as const,
      }
      mockPrisma.membership.findUnique.mockResolvedValue(employeeMembership)

      await expect(
        companyService.updateCompany(
          mockCompany.id,
          { id: mockCompany.id, ...updateData },
          mockUser
        )
      ).rejects.toThrow(ApiError)

      await expect(
        companyService.updateCompany(
          mockCompany.id,
          { id: mockCompany.id, ...updateData },
          mockUser
        )
      ).rejects.toThrow('Accès interdit')
    })
  })

  describe('deleteCompany', () => {
    it('should delete company when user is manager', async () => {
      const managerMembership = { ...mockMembership, role: 'MANAGER' as const }

      mockPrisma.membership.findUnique.mockResolvedValue(managerMembership)
      mockPrisma.membership.count.mockResolvedValue(1)
      mockPrisma.company.delete.mockResolvedValue(mockCompany)

      await companyService.deleteCompany(mockCompany.id, mockUser)

      expect(mockPrisma.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: mockUser.id,
            companyId: mockCompany.id,
          },
        },
      })

      expect(mockPrisma.company.delete).toHaveBeenCalledWith({
        where: { id: mockCompany.id },
      })
    })

    it('should throw ApiError when user is not manager', async () => {
      const employeeMembership = {
        ...mockMembership,
        role: 'EMPLOYEE' as const,
      }
      mockPrisma.membership.findUnique.mockResolvedValue(employeeMembership)

      await expect(
        companyService.deleteCompany(mockCompany.id, mockUser)
      ).rejects.toThrow(ApiError)

      await expect(
        companyService.deleteCompany(mockCompany.id, mockUser)
      ).rejects.toThrow('Accès interdit')
    })

    it('should throw ApiError when membership not found', async () => {
      mockPrisma.membership.findUnique.mockResolvedValue(null)

      await expect(
        companyService.deleteCompany(mockCompany.id, mockUser)
      ).rejects.toThrow(ApiError)

      await expect(
        companyService.deleteCompany(mockCompany.id, mockUser)
      ).rejects.toThrow('Accès interdit')
    })
  })
})
