import { render, screen, waitFor } from '@testing-library/react'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

import { useSession } from '@/lib/auth-client'
import { useCompanyStore } from '@/stores/use-company-store'

import MainLayout from '../main-layout'

// Mock des dépendances
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
}))

jest.mock('@/stores/use-company-store', () => ({
  useCompanyStore: jest.fn(),
}))

jest.mock('@/components/nav/app-sidebar', () => ({
  AppSidebar: ({ variant }: { variant: string }) => (
    <div data-testid='app-sidebar' data-variant={variant}>
      App Sidebar
    </div>
  ),
}))

jest.mock('@/components/nav/site-header', () => ({
  SiteHeader: () => <div data-testid='site-header'>Site Header</div>,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-provider'>{children}</div>
  ),
  SidebarInset: ({ children }: { children: ReactNode }) => (
    <div data-testid='sidebar-inset'>{children}</div>
  ),
}))

jest.mock('lucide-react', () => ({
  LoaderCircleIcon: (props: any) => (
    <div data-testid='loading-spinner' className='animate-spin' {...props}>
      Loading...
    </div>
  ),
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseCompanyStore = useCompanyStore as jest.MockedFunction<
  typeof useCompanyStore
>

const mockPush = jest.fn()

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })
  })

  describe('Rendu des enfants pour les routes auth', () => {
    it('devrait rendre directement les enfants pour les routes /auth', () => {
      mockUsePathname.mockReturnValue('/auth/signin')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='auth-content'>Auth Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('auth-content')).toBeInTheDocument()
      expect(screen.queryByTestId('sidebar-provider')).not.toBeInTheDocument()
    })

    it('devrait rendre directement les enfants pour /auth/signup', () => {
      mockUsePathname.mockReturnValue('/auth/signup')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='auth-content'>Signup Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('auth-content')).toBeInTheDocument()
      expect(screen.queryByTestId('sidebar-provider')).not.toBeInTheDocument()
    })
  })

  describe('État de chargement', () => {
    it('devrait afficher un spinner de chargement quand isPending est true', () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('main-content')).not.toBeInTheDocument()
    })
  })

  describe("Redirection d'authentification", () => {
    it("devrait rediriger vers /auth/signin si l'utilisateur n'est pas connecté", async () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })

    it("ne devrait pas rediriger si l'utilisateur est sur une route auth", () => {
      mockUsePathname.mockReturnValue('/auth/signin')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='auth-content'>Auth Content</div>
        </MainLayout>
      )

      expect(mockPush).not.toHaveBeenCalled()
    })

    it("ne devrait pas rediriger si l'utilisateur est connecté", () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: {
            id: 'session-1',
            token: 'test-token',
            userId: '1',
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: { id: '1', name: 'Test Company' },
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Layout principal avec sidebar', () => {
    it("devrait rendre le layout complet avec sidebar quand l'utilisateur est connecté et a une entreprise active", () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: {
            id: 'session-1',
            token: 'test-token',
            userId: '1',
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: { id: '1', name: 'Test Company' },
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('app-sidebar')).toHaveAttribute(
        'data-variant',
        'inset'
      )
      expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument()
      expect(screen.getByTestId('site-header')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it("devrait afficher le message d'absence d'entreprise quand activeCompany est null", () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: {
            id: 'session-1',
            token: 'test-token',
            userId: '1',
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
      expect(screen.getByTestId('site-header')).toBeInTheDocument()
      expect(
        screen.getByText(
          "Vous n'avez encore aucune entreprise. Ajoutez-en une maintenant pour profiter de l'application !"
        )
      ).toBeInTheDocument()
      expect(screen.queryByTestId('main-content')).not.toBeInTheDocument()
    })
  })

  describe('Gestion des différents états de session', () => {
    it('devrait gérer le cas où data.user est undefined', async () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })

    it('devrait gérer le cas où data est undefined', async () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: null,
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin')
      })
    })
  })

  describe('Structure du layout', () => {
    it('devrait avoir la structure CSS correcte', () => {
      mockUsePathname.mockReturnValue('/dashboard')
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: {
            id: 'session-1',
            token: 'test-token',
            userId: '1',
            expiresAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        isPending: false,
        error: null,
        refetch: jest.fn(),
      })
      mockUseCompanyStore.mockReturnValue({
        activeCompany: { id: '1', name: 'Test Company' },
        companies: [],
        setActiveCompany: jest.fn(),
        addCompany: jest.fn(),
        updateCompany: jest.fn(),
        removeCompany: jest.fn(),
      })

      const { container } = render(
        <MainLayout>
          <div data-testid='main-content'>Main Content</div>
        </MainLayout>
      )

      const flexContainer = container.querySelector('.flex.flex-1.flex-col')
      expect(flexContainer).toBeInTheDocument()

      const mainContainer = container.querySelector(
        '[class*="@container/main"]'
      )
      expect(mainContainer).toBeInTheDocument()
    })
  })
})
