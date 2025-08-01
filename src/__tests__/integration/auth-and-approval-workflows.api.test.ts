import { NextRequest } from 'next/server'

// Import des routes d'authentification
// Import des routes de révision de congés pour les workflows d'approbation
import { POST as reviewLeave } from '../../../app/api/companies/[companyId]/leaves/[leaveId]/review/route'

// Mock de l'authentification pour tester différents scénarios
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn(),
}))

// Mock du service de congés pour les workflows d'approbation
jest.mock('../../lib/services/leave-service', () => ({
  leaveService: {
    reviewLeave: jest.fn().mockResolvedValue({
      id: 'leave-1',
      status: 'APPROVED',
      reviewedAt: '2024-01-15T10:00:00Z',
      reviewedBy: 'manager-user-id',
      reviewComment: 'Approved for vacation',
    }),
  },
}))

describe("API Authentification et Workflows d'Approbation - Tests d'intégration", () => {
  const { requireAuth: mockRequireAuth } = jest.requireMock(
    '../../lib/auth-server'
  )

  describe("Tests d'Authentification", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("devrait permettre l'accès avec une authentification valide", async () => {
      // Mock utilisateur authentifié avec rôle manager
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'manager-user-id',
          email: 'manager@company.com',
          role: 'MANAGER',
          companyId: 'company-1',
        },
      })

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Approved for vacation',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'leave-1',
        status: 'APPROVED',
        reviewedBy: 'manager-user-id',
        reviewComment: 'Approved for vacation',
      })
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })

    it("devrait rejeter l'accès sans authentification", async () => {
      // Mock échec d'authentification
      mockRequireAuth.mockRejectedValue(
        new Error('Unauthorized: No valid session')
      )

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Approved for vacation',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500) // handleApiError convertit en 500
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })

    it("devrait rejeter l'accès avec un token expiré", async () => {
      // Mock token expiré
      mockRequireAuth.mockRejectedValue(
        new Error('Unauthorized: Token expired')
      )

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Approved for vacation',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })

    it("devrait rejeter l'accès avec des permissions insuffisantes", async () => {
      // Mock utilisateur avec permissions insuffisantes
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'employee-user-id',
          email: 'employee@company.com',
          role: 'EMPLOYEE',
          companyId: 'company-1',
        },
      })

      // Mock erreur de permissions
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Forbidden: Insufficient permissions to review leaves')
      )

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Trying to approve',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })

    it("devrait rejeter l'accès inter-entreprises", async () => {
      // Mock utilisateur d'une autre entreprise
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'other-manager-id',
          email: 'manager@othercompany.com',
          role: 'MANAGER',
          companyId: 'company-2',
        },
      })

      // Mock erreur d'accès inter-entreprises
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Forbidden: Cannot access resources from different company')
      )

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Cross-company access attempt',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })
  })

  describe("Workflows d'Approbation de Congés", () => {
    beforeEach(() => {
      jest.clearAllMocks()
      // Mock utilisateur manager par défaut
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'manager-user-id',
          email: 'manager@company.com',
          role: 'MANAGER',
          companyId: 'company-1',
        },
      })
    })

    it('devrait approuver un congé avec succès', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Vacation approved - enjoy your time off!',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'leave-1',
        status: 'APPROVED',
        reviewedBy: 'manager-user-id',
        reviewComment: 'Approved for vacation',
      })
    })

    it('devrait rejeter un congé avec une raison', async () => {
      // Mock rejet de congé
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockResolvedValueOnce({
        id: 'leave-2',
        status: 'REJECTED',
        reviewedAt: '2024-01-15T10:00:00Z',
        reviewedBy: 'manager-user-id',
        reviewComment: 'Insufficient leave balance',
      })

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-2/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'REJECTED',
            comment: 'Insufficient leave balance',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-2',
      })

      const response = await reviewLeave(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'leave-2',
        status: 'REJECTED',
        reviewedBy: 'manager-user-id',
        reviewComment: 'Insufficient leave balance',
      })
    })

    it("devrait gérer les demandes d'approbation en lot", async () => {
      // Simulation d'approbation de plusieurs congés
      const leaveIds = ['leave-1', 'leave-2', 'leave-3']
      const responses = []

      for (const leaveId of leaveIds) {
        const { leaveService } = jest.requireMock(
          '../../lib/services/leave-service'
        )
        leaveService.reviewLeave.mockResolvedValueOnce({
          id: leaveId,
          status: 'APPROVED',
          reviewedAt: '2024-01-15T10:00:00Z',
          reviewedBy: 'manager-user-id',
          reviewComment: 'Batch approval',
        })

        const req = new NextRequest(
          `http://localhost:3000/api/companies/company-1/leaves/${leaveId}/review`,
          {
            method: 'POST',
            body: JSON.stringify({
              status: 'APPROVED',
              comment: 'Batch approval',
            }),
          }
        )
        const params = Promise.resolve({ companyId: 'company-1', leaveId })

        const response = await reviewLeave(req, { params })
        responses.push(response)
      }

      // Vérifier que toutes les approbations ont réussi
      for (const response of responses) {
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.status).toBe('APPROVED')
        expect(data.reviewComment).toBe('Batch approval')
      }
    })

    it('devrait valider les données de révision', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: '', // Commentaire vide
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      // Mock erreur de validation
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Invalid review status or missing comment')
      )

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
    })

    it('devrait empêcher la révision de congés déjà traités', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/already-reviewed/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Trying to re-approve',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'already-reviewed',
      })

      // Mock erreur de congé déjà traité
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Leave has already been reviewed')
      )

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
    })

    it("devrait empêcher l'auto-approbation", async () => {
      // Mock utilisateur qui essaie d'approuver son propre congé
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'employee-user-id',
          email: 'employee@company.com',
          role: 'EMPLOYEE',
          companyId: 'company-1',
        },
      })

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/own-leave/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Self-approval attempt',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'own-leave',
      })

      // Mock erreur d'auto-approbation
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Cannot review your own leave request')
      )

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
    })
  })

  describe("Tests d'Autorisation par Rôle", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('devrait permettre aux ADMIN de réviser tous les congés', async () => {
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@company.com',
          role: 'ADMIN',
          companyId: 'company-1',
        },
      })

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/leave-1/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Admin approval',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'leave-1',
      })

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(200)
    })

    it('devrait permettre aux MANAGER de réviser les congés de leur équipe', async () => {
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'manager-user-id',
          email: 'manager@company.com',
          role: 'MANAGER',
          companyId: 'company-1',
        },
      })

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/team-leave/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Manager approval for team member',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'team-leave',
      })

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(200)
    })

    it('devrait empêcher aux EMPLOYEE de réviser des congés', async () => {
      mockRequireAuth.mockResolvedValue({
        user: {
          id: 'employee-user-id',
          email: 'employee@company.com',
          role: 'EMPLOYEE',
          companyId: 'company-1',
        },
      })

      const req = new NextRequest(
        'http://localhost:3000/api/companies/company-1/leaves/other-leave/review',
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'APPROVED',
            comment: 'Unauthorized approval attempt',
          }),
        }
      )
      const params = Promise.resolve({
        companyId: 'company-1',
        leaveId: 'other-leave',
      })

      // Mock erreur de permissions
      const { leaveService } = jest.requireMock(
        '../../lib/services/leave-service'
      )
      leaveService.reviewLeave.mockRejectedValueOnce(
        new Error('Employees cannot review leave requests')
      )

      const response = await reviewLeave(req, { params })
      expect(response.status).toBe(500)
    })
  })
})
