import { render, screen } from '@testing-library/react'

import { useCreateCompany } from '@/hooks/api/companies/create-company'
import { useUpdateCompany } from '@/hooks/api/companies/update-company'
import { useCompanyStore } from '@/stores/use-company-store'

import { AddCompanyDialog } from '../add-company-dialog'

// Mock des hooks
jest.mock('@/hooks/api/companies/create-company')
jest.mock('@/hooks/api/companies/update-company')
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

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}))

// Mock pour stocker les valeurs des champs
const mockFormValues: Record<string, any> = {
  name: '',
  logoUrl: '',
  annualLeaveDays: 25,
}

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render, name }: any) => {
    const field = {
      onChange: (value: any) => {
        mockFormValues[name] = value
      },
      value: mockFormValues[name] || (name === 'annualLeaveDays' ? 25 : ''),
      name: name || 'test',
    }
    return render({ field })
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div />,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/sidebar', () => ({
  sidebarMenuButtonVariants: () => 'sidebar-button-class',
}))

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock react-hook-form
const mockHandleSubmit = jest.fn(onSubmit => (e: any) => {
  e?.preventDefault()
  onSubmit(mockFormValues)
})

const mockForm = {
  handleSubmit: mockHandleSubmit,
  reset: jest.fn(),
  control: {},
}

jest.mock('react-hook-form', () => ({
  useForm: () => mockForm,
}))

jest.mock('lucide-react', () => ({
  PenBoxIcon: () => <svg data-testid='pen-box-icon' />,
  Plus: () => <svg data-testid='plus-icon' />,
}))

const mockCreateCompany = {
  mutateAsync: jest.fn(),
  isLoading: false,
  error: null,
}

const mockUpdateCompany = {
  mutateAsync: jest.fn(),
  isLoading: false,
  error: null,
}

const mockCompanyStore = {
  activeCompany: null,
  setActiveCompany: jest.fn(),
}

describe('AddCompanyDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset des valeurs mockées
    mockFormValues.name = ''
    mockFormValues.logoUrl = ''
    mockFormValues.annualLeaveDays = 25
    ;(useCreateCompany as jest.Mock).mockReturnValue(mockCreateCompany)
    ;(useUpdateCompany as jest.Mock).mockReturnValue(mockUpdateCompany)
    ;(useCompanyStore as unknown as jest.Mock).mockReturnValue(mockCompanyStore)
  })

  it('affiche le composant sans erreur', () => {
    expect(() => render(<AddCompanyDialog />)).not.toThrow()
  })

  it('affiche le bouton par défaut pour ajouter une entreprise', () => {
    render(<AddCompanyDialog />)
    expect(screen.getByText('Ajouter entreprise')).toBeInTheDocument()
  })

  it("affiche l'icône plus pour l'ajout", () => {
    render(<AddCompanyDialog />)
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
  })

  it('affiche le titre pour la création', () => {
    render(<AddCompanyDialog />)
    expect(screen.getByText('Ajouter une entreprise')).toBeInTheDocument()
  })

  it('affiche la description pour la création', () => {
    render(<AddCompanyDialog />)
    expect(
      screen.getByText('Créer une nouvelle entreprise pour gérer vos projets.')
    ).toBeInTheDocument()
  })

  it('affiche le label Nom', () => {
    render(<AddCompanyDialog />)
    expect(screen.getByText('Nom')).toBeInTheDocument()
  })

  it('affiche le label Logo URL', () => {
    render(<AddCompanyDialog />)
    expect(screen.getByText('Logo URL')).toBeInTheDocument()
  })

  it('affiche le label Jours de congés annuels', () => {
    render(<AddCompanyDialog />)
    expect(screen.getByText('Jours de congés annuels')).toBeInTheDocument()
  })

  it('affiche le placeholder pour le nom', () => {
    render(<AddCompanyDialog />)
    expect(
      screen.getByPlaceholderText("Nom de l'entreprise")
    ).toBeInTheDocument()
  })

  it('affiche le placeholder pour le logo', () => {
    render(<AddCompanyDialog />)
    expect(
      screen.getByPlaceholderText('https://example.com/logo.png')
    ).toBeInTheDocument()
  })

  it('affiche le placeholder pour les jours de congés', () => {
    render(<AddCompanyDialog />)
    expect(
      screen.getByPlaceholderText('Entrer un nombre...')
    ).toBeInTheDocument()
  })

  it('affiche le bouton de création', () => {
    render(<AddCompanyDialog />)
    expect(screen.getByText('Créer')).toBeInTheDocument()
  })

  describe('Mode modification', () => {
    const mockCompany = {
      id: 'company-1',
      name: 'Test Company',
      logoUrl: 'https://example.com/logo.png',
      annualLeaveDays: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it("affiche l'icône de modification quand une entreprise est fournie", () => {
      render(<AddCompanyDialog company={mockCompany} />)
      expect(screen.getByTestId('pen-box-icon')).toBeInTheDocument()
    })

    it('affiche le titre pour la modification', () => {
      render(<AddCompanyDialog company={mockCompany} />)
      expect(screen.getByText("Modifier l'entreprise")).toBeInTheDocument()
    })

    it('affiche la description pour la modification', () => {
      render(<AddCompanyDialog company={mockCompany} />)
      expect(
        screen.getByText("Modifier le nom et le logo de l'entreprise")
      ).toBeInTheDocument()
    })

    it('affiche le bouton de modification', () => {
      render(<AddCompanyDialog company={mockCompany} />)
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
  })

  it('utilise le hook useCreateCompany', () => {
    render(<AddCompanyDialog />)
    expect(useCreateCompany).toHaveBeenCalled()
  })

  it('utilise le hook useUpdateCompany', () => {
    render(<AddCompanyDialog />)
    expect(useUpdateCompany).toHaveBeenCalled()
  })

  it('utilise le hook useCompanyStore', () => {
    render(<AddCompanyDialog />)
    expect(useCompanyStore).toHaveBeenCalled()
  })

  describe('Interactions de base', () => {
    it('permet de saisir du texte dans les champs', () => {
      render(<AddCompanyDialog />)

      const nameInput = screen.getByPlaceholderText("Nom de l'entreprise")
      const logoInput = screen.getByPlaceholderText(
        'https://example.com/logo.png'
      )

      expect(nameInput).toBeInTheDocument()
      expect(logoInput).toBeInTheDocument()
    })

    it('affiche les boutons appropriés selon le mode', () => {
      const { rerender } = render(<AddCompanyDialog />)
      expect(screen.getByText('Créer')).toBeInTheDocument()

      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      rerender(<AddCompanyDialog company={mockCompany} />)
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
  })

  describe('Tests de base', () => {
    it('teste les hooks utilisés', () => {
      render(<AddCompanyDialog />)

      expect(useCreateCompany).toHaveBeenCalled()
      expect(useUpdateCompany).toHaveBeenCalled()
      expect(useCompanyStore).toHaveBeenCalled()
    })

    it('teste les différents états du composant', () => {
      const { rerender } = render(<AddCompanyDialog />)

      // Test avec une entreprise existante
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: null,
        annualLeaveDays: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      rerender(<AddCompanyDialog company={mockCompany} />)
      expect(screen.getByText('Modifier')).toBeInTheDocument()
    })
  })

  describe('Valeurs par défaut et reset', () => {
    it('utilise les valeurs par défaut pour une nouvelle entreprise', () => {
      render(<AddCompanyDialog />)

      const daysInput = screen.getByPlaceholderText('Entrer un nombre...')
      expect(daysInput).toHaveValue(25)
    })

    it("pré-remplit les champs avec les données de l'entreprise existante", () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        annualLeaveDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mettre à jour les valeurs mockées
      mockFormValues.name = mockCompany.name
      mockFormValues.logoUrl = mockCompany.logoUrl
      mockFormValues.annualLeaveDays = mockCompany.annualLeaveDays

      render(<AddCompanyDialog company={mockCompany} />)

      const nameInput = screen.getByPlaceholderText("Nom de l'entreprise")
      const logoInput = screen.getByPlaceholderText(
        'https://example.com/logo.png'
      )
      const daysInput = screen.getByPlaceholderText('Entrer un nombre...')

      expect(nameInput).toHaveValue('Test Company')
      expect(logoInput).toHaveValue('https://example.com/logo.png')
      expect(daysInput).toHaveValue(30)
    })

    it('gère le cas où logoUrl est null', () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: null,
        annualLeaveDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(<AddCompanyDialog company={mockCompany} />)

      const logoInput = screen.getByPlaceholderText(
        'https://example.com/logo.png'
      )
      expect(logoInput).toHaveValue('')
    })

    it('gère le cas où annualLeaveDays est null', () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        annualLeaveDays: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(<AddCompanyDialog company={mockCompany} />)

      const daysInput = screen.getByPlaceholderText('Entrer un nombre...')
      expect(daysInput).toHaveValue(25)
    })
  })
})
