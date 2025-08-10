import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { LeaveStatus, LeaveType } from '@/generated/prisma'
import { useGetMembershipLeaves } from '@/hooks/api/leaves/get-membership-leaves'
import { useCompanyStore } from '@/stores/use-company-store'

import { LeaveRequestsCard } from '../leave-requests-card'

// Mocks
jest.mock('@/hooks/api/leaves/get-membership-leaves')
jest.mock('@/stores/use-company-store')

const mockUseGetMembershipLeaves =
  useGetMembershipLeaves as jest.MockedFunction<typeof useGetMembershipLeaves>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>

// Mock data
const mockCompany = {
  id: 'company-1',
  name: 'Test Company',
  userMembershipId: 'membership-1',
}

const mockLeaves = [
  {
    id: 'leave-1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-01'),
    type: LeaveType.PAID,
    status: LeaveStatus.PENDING,
    reason: 'Test leave 1',
    days: 1,
    membershipId: 'membership-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    halfDayPeriod: null,
  },
  {
    id: 'leave-2',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-01'),
    type: LeaveType.PAID,
    status: LeaveStatus.APPROVED,
    reason: 'Test leave 2',
    days: 1,
    membershipId: 'membership-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    halfDayPeriod: null,
  },
  {
    id: 'leave-3',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-01'),
    type: LeaveType.PAID,
    status: LeaveStatus.REJECTED,
    reason: 'Test leave 3',
    days: 1,
    membershipId: 'membership-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    halfDayPeriod: null,
  },
]

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('LeaveRequestsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendu avec données', () => {
    it('devrait afficher les statistiques correctement', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { container } = render(<LeaveRequestsCard />, {
        wrapper: createWrapper(),
      })

      // Vérifier le titre
      expect(screen.getByText('Demandes en cours')).toBeInTheDocument()

      // Vérifier les statistiques
      const allOnes = screen.getAllByText('1')
      expect(allOnes).toHaveLength(3) // Pending, Approved, Rejected

      // Vérifier les labels
      expect(screen.getByText('En attente')).toBeInTheDocument()
      expect(screen.getByText('Approuvées')).toBeInTheDocument()
      expect(screen.getByText('Rejetées')).toBeInTheDocument()

      // Vérifier le pourcentage
      expect(
        screen.getByText('33% des demandes approuvées')
      ).toBeInTheDocument()

      // Vérifier la présence des icônes via les éléments SVG
      const svgElements = container.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThanOrEqual(2) // FileTextIcon et Clock
    })

    it('devrait afficher la barre de progression', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { container } = render(<LeaveRequestsCard />, {
        wrapper: createWrapper(),
      })

      // Vérifier la présence de la barre de progression
      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('État de chargement', () => {
    it('devrait afficher le skeleton pendant le chargement', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { container } = render(<LeaveRequestsCard />, {
        wrapper: createWrapper(),
      })

      // Vérifier la présence des skeletons
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Cas avec données vides', () => {
    it("devrait afficher des zéros quand il n'y a pas de données", () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      const zeroElements = screen.getAllByText('0')
      expect(zeroElements).toHaveLength(3) // Pending, Approved, Rejected
      expect(screen.getByText('0% des demandes approuvées')).toBeInTheDocument()
    })

    it('devrait afficher des zéros quand les données sont undefined', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      const zeroElements = screen.getAllByText('0')
      expect(zeroElements).toHaveLength(3)
      expect(screen.getByText('0% des demandes approuvées')).toBeInTheDocument()
    })
  })

  describe('Calcul du pourcentage', () => {
    it('devrait calculer 100% quand toutes les demandes sont approuvées', () => {
      const allApprovedLeaves = [
        { ...mockLeaves[0], status: LeaveStatus.APPROVED },
        { ...mockLeaves[1], status: LeaveStatus.APPROVED },
        { ...mockLeaves[2], status: LeaveStatus.APPROVED },
      ]

      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: allApprovedLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      expect(
        screen.getByText('100% des demandes approuvées')
      ).toBeInTheDocument()
    })

    it("devrait calculer 0% quand aucune demande n'est approuvée", () => {
      const noneApprovedLeaves = [
        { ...mockLeaves[0], status: LeaveStatus.PENDING },
        { ...mockLeaves[1], status: LeaveStatus.REJECTED },
        { ...mockLeaves[2], status: LeaveStatus.REJECTED },
      ]

      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: noneApprovedLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      expect(screen.getByText('0% des demandes approuvées')).toBeInTheDocument()
    })
  })

  describe('Interactions avec les hooks', () => {
    it('devrait appeler useGetMembershipLeaves avec les bons paramètres', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      expect(mockUseGetMembershipLeaves).toHaveBeenCalledWith(
        'company-1',
        'membership-1'
      )
    })

    it('devrait gérer le cas où activeCompany est null', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      expect(mockUseGetMembershipLeaves).toHaveBeenCalledWith('', '')
    })
  })

  describe('Responsive design', () => {
    it('devrait avoir les classes CSS responsives appropriées', () => {
      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: mockLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { container } = render(<LeaveRequestsCard />, {
        wrapper: createWrapper(),
      })

      // Vérifier les classes responsives
      expect(container.querySelector('.px-4.sm\\:px-6')).toBeInTheDocument()
      expect(
        container.querySelector('.text-xs.sm\\:text-sm')
      ).toBeInTheDocument()
      expect(
        container.querySelector('.h-4.w-4.sm\\:h-5.sm\\:w-5')
      ).toBeInTheDocument()
    })
  })

  describe('Filtrage des statuts', () => {
    it('devrait filtrer correctement les différents statuts', () => {
      const mixedStatusLeaves = [
        { ...mockLeaves[0], status: LeaveStatus.PENDING },
        { ...mockLeaves[1], status: LeaveStatus.PENDING },
        { ...mockLeaves[2], status: LeaveStatus.APPROVED },
        {
          id: 'leave-4',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2024-04-01'),
          type: LeaveType.PAID,
          status: LeaveStatus.REJECTED,
          reason: 'Test',
          days: 1,
          membershipId: 'membership-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          halfDayPeriod: null,
        },
        {
          id: 'leave-5',
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-05-01'),
          type: LeaveType.PAID,
          status: LeaveStatus.REJECTED,
          reason: 'Test 2',
          days: 1,
          membershipId: 'membership-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          halfDayPeriod: null,
        },
      ]

      mockUseCompanyStore.mockReturnValue({
        activeCompany: mockCompany,
        setActiveCompany: jest.fn(),
      })
      mockUseGetMembershipLeaves.mockReturnValue({
        data: mixedStatusLeaves,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      render(<LeaveRequestsCard />, { wrapper: createWrapper() })

      // 2 pending, 1 approved, 2 rejected
      const allTwos = screen.getAllByText('2')
      const approvedCount = screen.getByText('1')

      expect(allTwos).toHaveLength(2) // Pending et Rejected
      expect(approvedCount).toBeInTheDocument()

      // 1 approuvée sur 5 total = 20%
      expect(
        screen.getByText('20% des demandes approuvées')
      ).toBeInTheDocument()
    })
  })
})
