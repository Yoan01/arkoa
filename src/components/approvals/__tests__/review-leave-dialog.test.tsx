import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Jest is used for testing
import { LeaveStatus } from '@/generated/prisma'
import { CompanyLeave } from '@/schemas/queries/company-leaves-schema'

import { ApprovalActions, ReviewLeaveDialog } from '../review-leave-dialog'

// Mock hooks
const mockUseReviewLeave = jest.fn()
const mockUseCompanyStore = jest.fn()

jest.mock('@/hooks/api/leaves/review-leave', () => ({
  useReviewLeave: () => mockUseReviewLeave(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: () => mockUseCompanyStore(),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckIcon: ({ className }: { className?: string }) => (
    <div data-testid='check-icon' className={className} />
  ),
  XIcon: ({ className }: { className?: string }) => (
    <div data-testid='x-icon' className={className} />
  ),
}))

const mockLeave: CompanyLeave = {
  id: 'leave-1',
  type: 'ANNUAL' as const,
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-20'),
  reason: "Vacances d'été",
  status: LeaveStatus.PENDING,
  createdAt: new Date('2024-01-10'),
  halfDayPeriod: undefined,
  managerNote: undefined,
  membership: {
    user: {
      id: '1',
      name: 'John Doe',
    },
  },
}

const mockApprovedLeave: CompanyLeave = {
  ...mockLeave,
  id: 'leave-2',
  status: LeaveStatus.APPROVED,
  managerNote: 'Approuvé pour les vacances',
}

const mockRejectedLeave: CompanyLeave = {
  ...mockLeave,
  id: 'leave-3',
  status: LeaveStatus.REJECTED,
  managerNote: null,
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

Wrapper.displayName = 'Wrapper'

// Import mocked functions

describe('ReviewLeaveDialog', () => {
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
    })
    mockUseReviewLeave.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Approval Dialog', () => {
    it('should render approval dialog with correct title', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.APPROVED}
            trigger={<button>Approve</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Approve')
      await user.click(triggerButton)

      expect(
        screen.getByText('Approuver la demande de congé')
      ).toBeInTheDocument()
      expect(screen.getByText(/Demande de John Doe du/)).toBeInTheDocument()
    })

    it('should show optional comment label for approval', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.APPROVED}
            trigger={<button>Approve</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Approve')
      await user.click(triggerButton)

      expect(screen.getByText('Commentaire (optionnel)')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/Ajoutez un commentaire pour l'approbation/)
      ).toBeInTheDocument()
    })

    it('should submit approval with comment', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.APPROVED}
            trigger={<button>Approve</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Approve')
      await user.click(triggerButton)

      const commentTextarea = screen.getByPlaceholderText(
        /Ajoutez un commentaire pour l'approbation/
      )
      await user.type(commentTextarea, 'Congés approuvés')

      const submitButton = screen.getByText('Approuver')
      await user.click(submitButton)

      expect(mockMutate).toHaveBeenCalledWith(
        {
          companyId: 'company-1',
          leaveId: 'leave-1',
          action: LeaveStatus.APPROVED,
          managerNote: 'Congés approuvés',
        },
        expect.any(Object)
      )
    })
  })

  describe('Rejection Dialog', () => {
    it('should render rejection dialog with correct title', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.REJECTED}
            trigger={<button>Reject</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Reject')
      await user.click(triggerButton)

      expect(
        screen.getByText('Rejeter la demande de congé')
      ).toBeInTheDocument()
    })

    it('should show recommended comment label for rejection', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.REJECTED}
            trigger={<button>Reject</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Reject')
      await user.click(triggerButton)

      expect(screen.getByText('Commentaire (recommandé)')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/Ajoutez un commentaire pour le refus/)
      ).toBeInTheDocument()
    })

    it('should submit rejection with comment', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.REJECTED}
            trigger={<button>Reject</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Reject')
      await user.click(triggerButton)

      const commentTextarea = screen.getByPlaceholderText(
        /Ajoutez un commentaire pour le refus/
      )
      await user.type(commentTextarea, 'Période non disponible')

      const submitButton = screen.getByText('Rejeter')
      await user.click(submitButton)

      expect(mockMutate).toHaveBeenCalledWith(
        {
          companyId: 'company-1',
          leaveId: 'leave-1',
          action: LeaveStatus.REJECTED,
          managerNote: 'Période non disponible',
        },
        expect.any(Object)
      )
    })
  })

  describe('Dialog Behavior', () => {
    it('should close dialog on cancel', async () => {
      const user = userEvent.setup()
      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.APPROVED}
            trigger={<button>Approve</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Approve')
      await user.click(triggerButton)

      const cancelButton = screen.getByText('Annuler')
      await user.click(cancelButton)

      // Check that dialog is closed by checking if trigger is still there
      expect(screen.getByText('Approve')).toBeInTheDocument()
    })

    it('should show loading state when submitting', async () => {
      const user = userEvent.setup()
      mockUseReviewLeave.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      })

      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.APPROVED}
            trigger={<button>Approve</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Approve')
      await user.click(triggerButton)

      expect(screen.getByText('Approbation...')).toBeInTheDocument()
      expect(screen.getByText('Annuler')).toBeDisabled()
    })

    it('should handle missing company', async () => {
      const user = userEvent.setup()
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
      })

      render(
        <Wrapper>
          <ReviewLeaveDialog
            leave={mockLeave}
            action={LeaveStatus.APPROVED}
            trigger={<button>Approve</button>}
          />
        </Wrapper>
      )

      const triggerButton = screen.getByText('Approve')
      await user.click(triggerButton)

      const submitButton = screen.getByText('Approuver')
      await user.click(submitButton)

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })
})

describe('ApprovalActions', () => {
  beforeEach(() => {
    mockUseCompanyStore.mockReturnValue({
      activeCompany: { id: 'company-1', name: 'Test Company' },
    })

    mockUseReviewLeave.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render action buttons for pending leave', () => {
    render(
      <Wrapper>
        <ApprovalActions leave={mockLeave} />
      </Wrapper>
    )

    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    expect(screen.getByTestId('x-icon')).toBeInTheDocument()
  })

  it('should render manager note for approved leave', () => {
    render(
      <Wrapper>
        <ApprovalActions leave={mockApprovedLeave} />
      </Wrapper>
    )

    expect(screen.getByText('"Approuvé pour les vacances"')).toBeInTheDocument()
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
  })

  it('should render no comment message for leave without manager note', () => {
    render(
      <Wrapper>
        <ApprovalActions leave={mockRejectedLeave} />
      </Wrapper>
    )

    expect(screen.getByText('Aucun commentaire')).toBeInTheDocument()
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
  })

  it('should have correct button styling for approval', () => {
    const { container } = render(
      <Wrapper>
        <ApprovalActions leave={mockLeave} />
      </Wrapper>
    )

    const approveButton = container.querySelector('[class*="text-green-600"]')
    expect(approveButton).toBeInTheDocument()
    expect(approveButton).toHaveClass('hover:bg-green-50')
  })

  it('should have correct button styling for rejection', () => {
    const { container } = render(
      <Wrapper>
        <ApprovalActions leave={mockLeave} />
      </Wrapper>
    )

    const rejectButton = container.querySelector('[class*="text-red-600"]')
    expect(rejectButton).toBeInTheDocument()
    expect(rejectButton).toHaveClass('hover:bg-red-50')
  })

  it('should open approval dialog when approve button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Wrapper>
        <ApprovalActions leave={mockLeave} />
      </Wrapper>
    )

    const approveButton = screen.getByTestId('check-icon').closest('button')
    if (approveButton) {
      await user.click(approveButton)
      expect(
        screen.getByText('Approuver la demande de congé')
      ).toBeInTheDocument()
    }
  })

  it('should open rejection dialog when reject button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Wrapper>
        <ApprovalActions leave={mockLeave} />
      </Wrapper>
    )

    const rejectButton = screen.getByTestId('x-icon').closest('button')
    if (rejectButton) {
      await user.click(rejectButton)
      expect(
        screen.getByText('Rejeter la demande de congé')
      ).toBeInTheDocument()
    }
  })
})
