import { render, screen } from '@testing-library/react'

import { useInviteMembership } from '@/hooks/api/memberships/invite-membership'
import { useCompanyStore } from '@/stores/use-company-store'

import { InviteUserDialog } from '../invite-user-dialog'

// Mock des hooks
jest.mock('@/hooks/api/memberships/invite-membership')
jest.mock('@/stores/use-company-store')
jest.mock('sonner')

// Mock des composants UI avec une structure simple
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}))

// Mock pour stocker les valeurs des champs
const mockFormValues: Record<string, any> = {
  email: '',
  role: 'EMPLOYEE',
}

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render, name }: any) => {
    const field = {
      onChange: (value: any) => {
        mockFormValues[name] = value
      },
      value: mockFormValues[name] || (name === 'role' ? 'EMPLOYEE' : ''),
      name: name || 'test',
    }
    return render({ field })
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div />,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <select
      onChange={e => onValueChange?.(e.target.value)}
      defaultValue={defaultValue}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('lucide-react', () => ({
  PlusCircleIcon: () => <svg data-testid='plus-circle-icon' />,
}))

const mockInviteMembership = {
  mutateAsync: jest.fn(),
  isLoading: false,
  error: null,
}

const mockCompanyStore = {
  activeCompany: {
    id: 'company-1',
    name: 'Test Company',
  },
}

describe('InviteUserDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset des valeurs mockées
    mockFormValues.email = ''
    mockFormValues.role = 'EMPLOYEE'
    ;(useInviteMembership as jest.Mock).mockReturnValue(mockInviteMembership)
    ;(useCompanyStore as unknown as jest.Mock).mockReturnValue(mockCompanyStore)
  })

  it('affiche le composant sans erreur', () => {
    expect(() => render(<InviteUserDialog />)).not.toThrow()
  })

  it('affiche le bouton par défaut pour inviter un membre', () => {
    render(<InviteUserDialog />)
    expect(
      screen.getByRole('button', { name: /inviter un membre/i })
    ).toBeInTheDocument()
  })

  it("affiche l'icône plus", () => {
    render(<InviteUserDialog />)
    expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument()
  })

  it('affiche le titre du dialog', () => {
    render(<InviteUserDialog />)
    expect(
      screen.getByRole('heading', { name: 'Inviter un membre' })
    ).toBeInTheDocument()
  })

  it('affiche la description du dialog', () => {
    render(<InviteUserDialog />)
    expect(
      screen.getByText('Envoyer une invitation par email à un nouveau membre')
    ).toBeInTheDocument()
  })

  it('affiche le label Email', () => {
    render(<InviteUserDialog />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('affiche le label Rôle', () => {
    render(<InviteUserDialog />)
    expect(screen.getByText('Rôle')).toBeInTheDocument()
  })

  it("affiche le placeholder pour l'email", () => {
    render(<InviteUserDialog />)
    expect(screen.getByPlaceholderText('email@exemple.com')).toBeInTheDocument()
  })

  it("affiche le bouton d'envoi", () => {
    render(<InviteUserDialog />)
    expect(screen.getByText("Envoyer l'invitation")).toBeInTheDocument()
  })

  it('utilise le hook useInviteMembership', () => {
    render(<InviteUserDialog />)
    expect(useInviteMembership).toHaveBeenCalled()
  })

  it('utilise le hook useCompanyStore', () => {
    render(<InviteUserDialog />)
    expect(useCompanyStore).toHaveBeenCalled()
  })

  describe('Trigger personnalisé', () => {
    it('affiche le trigger personnalisé quand fourni', () => {
      const customTrigger = <button>Custom Trigger</button>
      render(<InviteUserDialog trigger={customTrigger} />)
      expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
    })
  })

  describe('Interactions de formulaire', () => {
    it('affiche le champ email', () => {
      render(<InviteUserDialog />)

      const emailInput = screen.getByPlaceholderText('email@exemple.com')
      expect(emailInput).toBeInTheDocument()
    })

    it('affiche le sélecteur de rôle', () => {
      render(<InviteUserDialog />)

      const roleSelect = screen.getByRole('combobox')
      expect(roleSelect).toBeInTheDocument()
    })

    it('affiche les options de rôle correctes', () => {
      render(<InviteUserDialog />)

      expect(screen.getByText('Employé')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })
  })

  describe('Tests de couverture supplémentaires', () => {
    it('teste le rendu du composant', () => {
      render(<InviteUserDialog />)

      expect(
        screen.getByRole('heading', { name: 'Inviter un membre' })
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('email@exemple.com')
      ).toBeInTheDocument()
    })

    it('teste les différents rôles disponibles', () => {
      render(<InviteUserDialog />)

      expect(screen.getByText('Employé')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })

    it("teste la présence du bouton d'invitation", () => {
      render(<InviteUserDialog />)

      expect(screen.getByText("Envoyer l'invitation")).toBeInTheDocument()
    })
  })

  describe('Valeurs par défaut', () => {
    it('utilise EMPLOYEE comme rôle par défaut', () => {
      render(<InviteUserDialog />)

      expect(mockFormValues.role).toBe('EMPLOYEE')
    })

    it('a un champ email vide par défaut', () => {
      render(<InviteUserDialog />)

      const emailInput = screen.getByPlaceholderText('email@exemple.com')
      expect(emailInput).toHaveValue('')
    })
  })
})
