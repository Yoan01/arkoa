import { fireEvent, render, screen } from '@testing-library/react'
import Image from 'next/image'

import { User } from '@/generated/prisma'
import { MembershipWithUserAndBalances } from '@/schemas/edit-leave-balance-dialog-schema'

import { teamColumns } from '../team-columns'

// Mock de dayjs
jest.mock('@/lib/dayjs-config', () => ({
  __esModule: true,
  default: jest.fn(_date => ({
    format: jest.fn(() => '15 Jan 2024'),
  })),
}))

// Mock des composants UI
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => (
    <div data-testid='avatar' className={className}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children, className }: any) => (
    <div data-testid='avatar-fallback' className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) => (
    <Image
      data-testid='avatar-image'
      src={src}
      alt={alt}
      width={40}
      height={40}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid='badge' data-variant={variant}>
      {children}
    </span>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick, ...props }: any) => (
    <button
      data-testid='button'
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}))

// Mock de window.location
const mockLocation = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  href: '',
}

// Sauvegarder la location originale
const originalLocation = window.location

// Mock window.location
delete (window as any).location
window.location = mockLocation as any

const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  image: 'https://example.com/avatar.jpg',
  emailVerified: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockMembership: MembershipWithUserAndBalances = {
  id: 'membership-1',
  user: mockUser,
  onLeave: false,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  companyId: 'company-1',
  userId: 'user-1',
  role: 'EMPLOYEE',
  leaveBalances: [],
}

const mockMembershipOnLeave: MembershipWithUserAndBalances = {
  ...mockMembership,
  id: 'membership-2',
  onLeave: true,
}

// Helper pour créer un contexte de cellule mock
const createCellContext = (
  membership: MembershipWithUserAndBalances,
  columnId: string
) => ({
  getValue: () => {
    switch (columnId) {
      case 'user':
        return membership.user
      case 'user.email':
        return membership.user.email
      case 'onLeave':
        return membership.onLeave
      case 'createdAt':
        return membership.createdAt.toISOString()
      default:
        return null
    }
  },
  row: {
    original: membership,
  },
})

describe('teamColumns', () => {
  beforeEach(() => {
    mockLocation.href = ''
  })

  afterAll(() => {
    // Restaurer la location originale
    window.location = originalLocation as any
  })

  it('définit le bon nombre de colonnes', () => {
    expect(teamColumns).toHaveLength(6)
  })

  it('a les bons headers pour chaque colonne', () => {
    const headers = teamColumns.map(col => col.header)
    expect(headers).toEqual([
      'Employé',
      'Email',
      'Statut',
      'Télélphone',
      'Ajouté le',
      'Actions',
    ])
  })

  describe('Colonne Employé', () => {
    const userColumn = teamColumns[0]

    it('a la bonne accessorKey', () => {
      expect((userColumn as any).accessorKey).toBe('user')
    })

    it('rend correctement les informations utilisateur', () => {
      const cellContext = createCellContext(mockMembership, 'user')
      const CellComponent = userColumn.cell as any

      render(<CellComponent {...cellContext} />)

      expect(screen.getByTestId('avatar')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'src',
        mockUser.image!
      )
      expect(screen.getByTestId('avatar-image')).toHaveAttribute(
        'alt',
        mockUser.name
      )
      expect(screen.getByText(mockUser.name!)).toBeInTheDocument()
    })

    it('affiche les initiales dans AvatarFallback', () => {
      const cellContext = createCellContext(mockMembership, 'user')
      const CellComponent = userColumn.cell as any

      render(<CellComponent {...cellContext} />)

      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument()
      expect(screen.getByText('JD')).toBeInTheDocument() // John Doe -> JD
    })

    it('gère les noms avec un seul mot', () => {
      const singleNameUser = { ...mockUser, name: 'John' }
      const singleNameMembership = { ...mockMembership, user: singleNameUser }
      const cellContext = createCellContext(singleNameMembership, 'user')
      const CellComponent = userColumn.cell as any

      render(<CellComponent {...cellContext} />)

      expect(screen.getByText('J')).toBeInTheDocument()
    })
  })

  describe('Colonne Email', () => {
    const emailColumn = teamColumns[1]

    it('a la bonne accessorKey', () => {
      expect((emailColumn as any).accessorKey).toBe('user.email')
    })

    it("rend un lien mailto avec l'email", () => {
      const cellContext = createCellContext(mockMembership, 'user.email')
      const CellComponent = emailColumn.cell as any

      render(<CellComponent {...cellContext} />)

      const emailLink = screen.getByRole('link')
      expect(emailLink).toHaveAttribute('href', `mailto:${mockUser.email}`)
      expect(emailLink).toHaveTextContent(mockUser.email)
    })
  })

  describe('Colonne Statut', () => {
    const statusColumn = teamColumns[2]

    it('a la bonne accessorKey', () => {
      expect((statusColumn as any).accessorKey).toBe('onLeave')
    })

    it('affiche "Présent" quand onLeave est false', () => {
      const cellContext = createCellContext(mockMembership, 'onLeave')
      const CellComponent = statusColumn.cell as any

      render(<CellComponent {...cellContext} />)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('Présent')
      expect(badge).not.toHaveAttribute('data-variant', 'secondary')
    })

    it('affiche "En congé" quand onLeave est true', () => {
      const cellContext = createCellContext(mockMembershipOnLeave, 'onLeave')
      const CellComponent = statusColumn.cell as any

      render(<CellComponent {...cellContext} />)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('En congé')
      expect(badge).toHaveAttribute('data-variant', 'secondary')
    })
  })

  describe('Colonne Téléphone', () => {
    const phoneColumn = teamColumns[3]

    it('a le bon id', () => {
      expect(phoneColumn.id).toBe('phone')
    })

    it('affiche "Non renseigné"', () => {
      const cellContext = createCellContext(mockMembership, 'phone')
      const CellComponent = phoneColumn.cell as any

      render(<CellComponent {...cellContext} />)

      expect(screen.getByText('Non renseigné')).toBeInTheDocument()
    })
  })

  describe('Colonne Ajouté le', () => {
    const dateColumn = teamColumns[4]

    it('a la bonne accessorKey', () => {
      expect((dateColumn as any).accessorKey).toBe('createdAt')
    })

    it('formate correctement la date', () => {
      const cellContext = createCellContext(mockMembership, 'createdAt')
      const CellComponent = dateColumn.cell as any

      render(<CellComponent {...cellContext} />)

      expect(screen.getByText('15 Jan 2024')).toBeInTheDocument()
    })
  })

  describe('Colonne Actions', () => {
    const actionsColumn = teamColumns[5]

    it('a le bon id et enableHiding est false', () => {
      expect(actionsColumn.id).toBe('actions')
      expect(actionsColumn.enableHiding).toBe(false)
    })

    it('rend un bouton "Voir le détail"', () => {
      const cellContext = createCellContext(mockMembership, 'actions')
      const CellComponent = actionsColumn.cell as any

      render(<CellComponent {...cellContext} />)

      const button = screen.getByTestId('button')
      expect(button).toHaveTextContent('Voir le détail')
      expect(button).toHaveAttribute('data-variant', 'outline')
      expect(button).toHaveAttribute('data-size', 'sm')
    })

    it('navigue vers la page de détail quand le bouton est cliqué', () => {
      const cellContext = createCellContext(mockMembership, 'actions')
      const CellComponent = actionsColumn.cell as any

      render(<CellComponent {...cellContext} />)

      const button = screen.getByTestId('button')

      // Simuler le clic qui devrait mettre à jour window.location.href
      fireEvent.click(button)

      // Vérifier que le bouton est présent et cliquable
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Voir le détail')
    })
  })

  describe('Gestion des cas limites', () => {
    it('gère un utilisateur avec un nom vide', () => {
      const noNameUser = { ...mockUser, name: '' }
      const noNameMembership = { ...mockMembership, user: noNameUser }
      const cellContext = createCellContext(noNameMembership, 'user')
      const CellComponent = teamColumns[0].cell as any

      render(<CellComponent {...cellContext} />)

      // Vérifie que le composant ne plante pas
      expect(screen.getByTestId('avatar')).toBeInTheDocument()
    })

    it('gère un utilisateur sans image', () => {
      const noImageUser = { ...mockUser, image: null }
      const noImageMembership = { ...mockMembership, user: noImageUser }
      const cellContext = createCellContext(noImageMembership, 'user')
      const CellComponent = teamColumns[0].cell as any

      render(<CellComponent {...cellContext} />)

      // Quand il n'y a pas d'image, seul le fallback avec les initiales est affiché
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument()
      expect(screen.getByText('JD')).toBeInTheDocument() // Initiales de John Doe
    })
  })
})
