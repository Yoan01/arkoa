import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { DialogAction } from '../dialog-action'

// Mock du composant Button pour tester les variants
jest.mock('../button', () => ({
  buttonVariants: jest.fn(({ variant }) => `button-${variant || 'default'}`),
}))

// Mock de cn utility
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

// Mock complet d'AlertDialog pour simplifier les tests
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => (
    <div data-testid='alert-dialog'>{children}</div>
  ),
  AlertDialogTrigger: ({ children }: any) => (
    <div data-testid='alert-dialog-trigger'>{children}</div>
  ),
  AlertDialogContent: ({ children }: any) => (
    <div data-testid='alert-dialog-content'>{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => (
    <div data-testid='alert-dialog-header'>{children}</div>
  ),
  AlertDialogTitle: ({ children }: any) => (
    <h2 data-testid='alert-dialog-title'>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <p data-testid='alert-dialog-description'>{children}</p>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid='alert-dialog-footer'>{children}</div>
  ),
  AlertDialogCancel: ({ children }: any) => (
    <button data-testid='alert-dialog-cancel'>{children}</button>
  ),
  AlertDialogAction: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid='alert-dialog-action'
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}))

describe('DialogAction', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendu de base', () => {
    it('devrait rendre le composant avec les props par défaut', () => {
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Ouvrir Dialog</button>
        </DialogAction>
      )

      expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument()
      expect(screen.getByText('Ouvrir Dialog')).toBeInTheDocument()
    })

    it('devrait afficher le titre par défaut', () => {
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument()
      expect(screen.getByText('Êtes-vous sur ?')).toBeInTheDocument()
    })

    it('devrait afficher la description par défaut', () => {
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByTestId('alert-dialog-description')).toBeInTheDocument()
      expect(
        screen.getByText('Cette action ne peut pas être annulée.')
      ).toBeInTheDocument()
    })
  })

  describe('Props personnalisées', () => {
    it('devrait afficher un titre personnalisé', () => {
      const customTitle = 'Titre personnalisé'
      render(
        <DialogAction onClick={mockOnClick} title={customTitle}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByText(customTitle)).toBeInTheDocument()
    })

    it('devrait afficher une description personnalisée', () => {
      const customDescription = 'Description personnalisée'
      render(
        <DialogAction onClick={mockOnClick} description={customDescription}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByText(customDescription)).toBeInTheDocument()
    })

    it('devrait accepter un titre ReactNode', () => {
      const titleNode = (
        <span>
          Titre <strong>avec JSX</strong>
        </span>
      )
      render(
        <DialogAction onClick={mockOnClick} title={titleNode}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByText('Titre')).toBeInTheDocument()
      expect(screen.getByText('avec JSX')).toBeInTheDocument()
    })

    it('devrait accepter une description ReactNode', () => {
      const descriptionNode = (
        <span>
          Description <em>avec JSX</em>
        </span>
      )
      render(
        <DialogAction onClick={mockOnClick} description={descriptionNode}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('avec JSX')).toBeInTheDocument()
    })
  })

  describe('Types de bouton', () => {
    it('devrait utiliser le type destructive par défaut', () => {
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Trigger</button>
        </DialogAction>
      )

      const confirmButton = screen.getByTestId('alert-dialog-action')
      expect(confirmButton).toHaveClass('button-destructive')
    })

    it('devrait utiliser le type default quand spécifié', () => {
      render(
        <DialogAction onClick={mockOnClick} type='default'>
          <button>Trigger</button>
        </DialogAction>
      )

      const confirmButton = screen.getByTestId('alert-dialog-action')
      expect(confirmButton).toHaveClass('button-default')
    })
  })

  describe('État disabled', () => {
    it('devrait désactiver le bouton de confirmation quand disabled=true', () => {
      render(
        <DialogAction onClick={mockOnClick} disabled>
          <button>Trigger</button>
        </DialogAction>
      )

      const confirmButton = screen.getByTestId('alert-dialog-action')
      expect(confirmButton).toBeDisabled()
    })

    it('devrait activer le bouton de confirmation quand disabled=false', () => {
      render(
        <DialogAction onClick={mockOnClick} disabled={false}>
          <button>Trigger</button>
        </DialogAction>
      )

      const confirmButton = screen.getByTestId('alert-dialog-action')
      expect(confirmButton).not.toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('devrait appeler onClick quand le bouton Confirmer est cliqué', async () => {
      const user = userEvent.setup()
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Trigger</button>
        </DialogAction>
      )

      await user.click(screen.getByTestId('alert-dialog-action'))
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('ne devrait pas appeler onClick quand le bouton Cancel est cliqué', async () => {
      const user = userEvent.setup()
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Trigger</button>
        </DialogAction>
      )

      await user.click(screen.getByTestId('alert-dialog-cancel'))
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('Affichage des éléments', () => {
    it('devrait afficher tous les éléments de la boîte de dialogue', () => {
      render(
        <DialogAction
          onClick={mockOnClick}
          title='Test Title'
          description='Test Description'
        >
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByTestId('alert-dialog-header')).toBeInTheDocument()
      expect(screen.getByTestId('alert-dialog-title')).toBeInTheDocument()
      expect(screen.getByTestId('alert-dialog-description')).toBeInTheDocument()
      expect(screen.getByTestId('alert-dialog-footer')).toBeInTheDocument()
      expect(screen.getByTestId('alert-dialog-cancel')).toBeInTheDocument()
      expect(screen.getByTestId('alert-dialog-action')).toBeInTheDocument()
    })

    it('devrait afficher le texte correct sur les boutons', () => {
      render(
        <DialogAction onClick={mockOnClick}>
          <button>Trigger</button>
        </DialogAction>
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirmer')).toBeInTheDocument()
    })
  })

  describe('Classes CSS et variants', () => {
    it('devrait appliquer les bonnes classes pour le type destructive', () => {
      render(
        <DialogAction onClick={mockOnClick} type='destructive'>
          <button>Trigger</button>
        </DialogAction>
      )

      const confirmButton = screen.getByTestId('alert-dialog-action')
      expect(confirmButton).toHaveClass('button-destructive')
    })

    it('devrait appliquer les bonnes classes pour le type default', () => {
      render(
        <DialogAction onClick={mockOnClick} type='default'>
          <button>Trigger</button>
        </DialogAction>
      )

      const confirmButton = screen.getByTestId('alert-dialog-action')
      expect(confirmButton).toHaveClass('button-default')
    })
  })
})
